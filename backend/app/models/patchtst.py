import torch
import torch.nn as nn
import math

class PatchEmbedding(nn.Module):
    def __init__(self, patch_size, d_model):
        super().__init__()
        self.patch_size = patch_size
        self.projection = nn.Linear(patch_size, d_model)
        
    def forward(self, x):
        return self.projection(x)

class PhysiologicalEncoder(nn.Module):
    def __init__(self, num_features, patch_size, d_model):
        super().__init__()
        self.embeddings = nn.ModuleList([
            PatchEmbedding(patch_size, d_model) for _ in range(num_features)
        ])
        
    def forward(self, x):
        batch, num_patches, patch_size, num_features = x.shape
        embs = []
        for i in range(num_features):
            embs.append(self.embeddings[i](x[:, :, :, i]))
        return torch.cat(embs, dim=-1)

class CrossAttentionFusion(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.mha = nn.MultiheadAttention(embed_dim=d_model, num_heads=n_heads, batch_first=True)
        self.norm = nn.LayerNorm(d_model)
        
    def forward(self, query, key_value):
        attn_out, attn_weights = self.mha(query, key_value, key_value)
        return self.norm(query + attn_out), attn_weights

class PatchTSTModel(nn.Module):
    def __init__(
        self, 
        d_model=128, 
        n_heads=8, 
        n_layers=4, 
        d_ff=256, 
        patch_size=24, 
        dropout=0.1, 
        num_physio_features=6, 
        num_env_features=9, 
        num_clinical_features=8
    ):
        super().__init__()
        
        self.physio_encoder = PhysiologicalEncoder(num_physio_features, patch_size, d_model)
        self.env_projection = nn.Linear(num_env_features * patch_size, d_model)
        self.clinical_mlp = nn.Sequential(
            nn.Linear(num_clinical_features * patch_size, d_model),
            nn.ReLU(),
            nn.Linear(d_model, d_model)
        )
        
        self.physio_proj = nn.Linear(num_physio_features * d_model, d_model)
        
        self.fusion = CrossAttentionFusion(d_model, n_heads)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=n_heads, dim_feedforward=d_ff, dropout=dropout, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        
        self.survival_head = nn.Sequential(
            nn.Linear(d_model * 2, d_model),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, 1)
        )

    def forward(self, physio, env, clinical):
        p_emb = self.physio_encoder(physio)
        p_emb = self.physio_proj(p_emb)
        
        batch, num_patches, patch_size, num_env_features = env.shape
        e_emb = self.env_projection(env.reshape(batch, num_patches, -1))
        
        batch, num_patches, patch_size, num_clinical_features = clinical.shape
        c_emb = self.clinical_mlp(clinical.reshape(batch, num_patches, -1))
        
        fused_emb, attn_weights = self.fusion(p_emb, e_emb)
        
        trans_out = self.transformer(fused_emb)
        
        combined = torch.cat([trans_out, c_emb], dim=-1)
        
        hazard_ratio = self.survival_head(combined)
        
        return hazard_ratio.squeeze(-1), attn_weights
