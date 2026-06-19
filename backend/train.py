import torch
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np
from app.data.generator import SyntheticAsthmaDataGenerator
from app.data.preprocessing import AsthmaDataPreprocessor
from app.models.patchtst import PatchTSTModel
from app.models.losses import CombinedSurvivalLoss

def train():
    print("Generating synthetic data for 100 patients...")
    generator = SyntheticAsthmaDataGenerator()
    physio, env, clinical, events, tte = generator.generate_n_patients(100)
    
    split = int(0.8 * 100)
    
    print("Preprocessing data...")
    preprocessor = AsthmaDataPreprocessor(patch_size=24)
    preprocessor.fit(physio[:split], env[:split], clinical[:split])
    
    train_tensors = preprocessor.prepare_tensors(
        physio[:split], env[:split], clinical[:split], events[:split], tte[:split]
    )
    val_tensors = preprocessor.prepare_tensors(
        physio[split:], env[split:], clinical[split:], events[split:], tte[split:]
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
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = PatchTSTModel().to(device)
    
    criterion = CombinedSurvivalLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    
    epochs = 10
    best_val_loss = float('inf')
    
    print("Starting training...")
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
        
        print(f"Epoch {epoch+1}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), "best_model.pth")
            print("  Saved best model checkpoint!")
            
    print("Training complete!")

if __name__ == "__main__":
    train()
