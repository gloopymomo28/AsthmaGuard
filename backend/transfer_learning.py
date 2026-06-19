import torch
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np
import os
from app.data.public_loader import PublicAsthmaDatasetLoader
from app.data.preprocessing import AsthmaDataPreprocessor
from app.models.patchtst import PatchTSTModel
from app.models.losses import CombinedSurvivalLoss

def run_transfer_learning(csv_path="data/clinical_data.csv"):
    print(f"Initializing Transfer Learning pipeline...")
    
    # 1. Load Public Dataset
    print(f"Loading public dataset from {csv_path}...")
    loader = PublicAsthmaDatasetLoader()
    physio, env, clinical, events, tte = loader.load_and_preprocess(csv_path)
    
    split = int(0.8 * len(physio))
    
    # 2. Preprocess
    preprocessor = AsthmaDataPreprocessor(patch_size=24)
    preprocessor.fit(physio[:split], env[:split], clinical[:split])
    
    train_tensors = preprocessor.prepare_tensors(
        physio[:split], env[:split], clinical[:split], events[:split], tte[:split]
    )
    
    train_dataset = TensorDataset(
        train_tensors["physio"], train_tensors["env"], train_tensors["clinical"],
        train_tensors["events"], train_tensors["tte"]
    )
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    
    # 3. Load Pre-trained Model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = PatchTSTModel().to(device)
    
    if os.path.exists("best_model.pth"):
        print("Loading pre-trained synthetic weights (best_model.pth)...")
        model.load_state_dict(torch.load("best_model.pth", map_location=device))
    else:
        print("WARNING: best_model.pth not found. Starting from scratch.")
        
    # 4. Freeze Base Layers (Transfer Learning)
    print("Freezing physiological encoder, environment projection, and transformer layers...")
    for param in model.physio_encoder.parameters():
        param.requires_grad = False
    for param in model.env_projection.parameters():
        param.requires_grad = False
    for param in model.transformer.parameters():
        param.requires_grad = False
        
    # 5. Fine-Tune
    # Only training clinical MLP and survival head
    trainable_params = filter(lambda p: p.requires_grad, model.parameters())
    optimizer = optim.Adam(trainable_params, lr=1e-5) # Very low learning rate for fine-tuning
    criterion = CombinedSurvivalLoss()
    
    epochs = 5 # Fewer epochs for fine-tuning
    print("Starting fine-tuning...")
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        for p, e, c, ev, t in train_loader:
            p, e, c, ev, t = p.to(device), e.to(device), c.to(device), ev.to(device), t.to(device)
            
            optimizer.zero_grad()
            hazard_ratios, _ = model(p, e, c)
            loss = criterion(hazard_ratios, ev, t)
            
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            
        train_loss /= len(train_loader)
        print(f"Epoch {epoch+1}/{epochs} | Fine-Tuning Train Loss: {train_loss:.4f}")
        
    print("Saving fine-tuned model to finetuned_model.pth")
    torch.save(model.state_dict(), "finetuned_model.pth")
    print("Transfer Learning Complete!")

if __name__ == "__main__":
    run_transfer_learning()
