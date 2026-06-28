"""
Full Transfer Learning on CAMP Teaching Dataset with:
- 80/20 train/validation split
- 30 epochs with early stopping (patience=5)
- Learning rate scheduler
- Best model checkpoint based on validation loss
"""
import torch
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

from app.data.public_loader import PublicAsthmaDatasetLoader
from app.data.preprocessing import AsthmaDataPreprocessor
from app.models.patchtst import PatchTSTModel
from app.models.losses import CombinedSurvivalLoss

def run_full_training():
    print("=" * 60)
    print("  AsthmaGuard AI - Full Transfer Learning on CAMP Dataset")
    print("=" * 60)
    
    # 1. Load CAMP data
    loader = PublicAsthmaDatasetLoader()
    physio, env, clinical, events, tte = loader.load_and_preprocess(
        "data/camp_teaching/CAMP_csv/camp_teach.csv"
    )
    
    n_patients = len(physio)
    split = int(0.8 * n_patients)
    
    # Shuffle patients before splitting
    np.random.seed(42)
    indices = np.random.permutation(n_patients)
    train_idx, val_idx = indices[:split], indices[split:]
    
    print(f"\nTrain patients: {len(train_idx)}, Validation patients: {len(val_idx)}")
    
    # 2. Preprocess
    preprocessor = AsthmaDataPreprocessor(patch_size=24)
    preprocessor.fit(physio[train_idx], env[train_idx], clinical[train_idx])
    
    train_tensors = preprocessor.prepare_tensors(
        physio[train_idx], env[train_idx], clinical[train_idx],
        events[train_idx], tte[train_idx]
    )
    val_tensors = preprocessor.prepare_tensors(
        physio[val_idx], env[val_idx], clinical[val_idx],
        events[val_idx], tte[val_idx]
    )
    
    train_dataset = TensorDataset(
        train_tensors["physio"], train_tensors["env"], train_tensors["clinical"],
        train_tensors["events"], train_tensors["tte"]
    )
    val_dataset = TensorDataset(
        val_tensors["physio"], val_tensors["env"], val_tensors["clinical"],
        val_tensors["events"], val_tensors["tte"]
    )
    
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False)
    
    # 3. Load pre-trained model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    
    model = PatchTSTModel().to(device)
    
    if os.path.exists("best_model.pth"):
        print("Loading pre-trained synthetic weights (best_model.pth)...")
        model.load_state_dict(torch.load("best_model.pth", map_location=device))
    else:
        print("WARNING: best_model.pth not found. Training from scratch.")
    
    # 4. Freeze base layers for transfer learning
    print("Freezing base layers (physio encoder, env projection, transformer)...")
    for param in model.physio_encoder.parameters():
        param.requires_grad = False
    for param in model.env_projection.parameters():
        param.requires_grad = False
    for param in model.transformer.parameters():
        param.requires_grad = False
    
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    print(f"Trainable parameters: {trainable:,} / {total:,} ({100*trainable/total:.1f}%)")
    
    # 5. Optimizer + Scheduler
    trainable_params = filter(lambda p: p.requires_grad, model.parameters())
    optimizer = optim.Adam(trainable_params, lr=5e-4, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=3)
    criterion = CombinedSurvivalLoss()
    
    # 6. Training loop with early stopping
    epochs = 30
    patience = 5
    best_val_loss = float('inf')
    patience_counter = 0
    
    print(f"\nStarting training ({epochs} max epochs, early stopping patience={patience})...")
    print("-" * 60)
    
    for epoch in range(epochs):
        # --- Train ---
        model.train()
        train_loss = 0
        for p, e, c, ev, t in train_loader:
            p, e, c, ev, t = p.to(device), e.to(device), c.to(device), ev.to(device), t.to(device)
            optimizer.zero_grad()
            hazard_ratios, _ = model(p, e, c)
            loss = criterion(hazard_ratios, ev, t)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            train_loss += loss.item()
        
        # --- Validate ---
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for p, e, c, ev, t in val_loader:
                p, e, c, ev, t = p.to(device), e.to(device), c.to(device), ev.to(device), t.to(device)
                hazard_ratios, _ = model(p, e, c)
                loss = criterion(hazard_ratios, ev, t)
                val_loss += loss.item()
        
        train_loss /= len(train_loader)
        val_loss /= len(val_loader)
        
        lr = optimizer.param_groups[0]['lr']
        print(f"Epoch {epoch+1:2d}/{epochs} | Train: {train_loss:.4f} | Val: {val_loss:.4f} | LR: {lr:.6f}", end="")
        
        # --- Early stopping check ---
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            torch.save(model.state_dict(), "finetuned_model.pth")
            print(" << BEST (saved)")
        else:
            patience_counter += 1
            print(f" (no improvement {patience_counter}/{patience})")
            if patience_counter >= patience:
                print(f"\nEarly stopping triggered at epoch {epoch+1}.")
                break
        
        scheduler.step(val_loss)
    
    print("-" * 60)
    print(f"Training complete! Best validation loss: {best_val_loss:.4f}")
    print(f"Fine-tuned model saved to: finetuned_model.pth")

if __name__ == "__main__":
    run_full_training()
