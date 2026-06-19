import torch
import torch.nn as nn
import torch.nn.functional as F

class CoxPHLoss(nn.Module):
    def __init__(self):
        super().__init__()

    def forward(self, hazard_ratios, events, tte):
        hr_flat = hazard_ratios.reshape(-1)
        events_flat = events.reshape(-1)
        tte_flat = tte.reshape(-1)
        
        idx = torch.argsort(tte_flat, descending=True)
        events_sorted = events_flat[idx]
        hr_sorted = hr_flat[idx]
        
        risk_scores = hr_sorted
        max_risk = risk_scores.max()
        log_risk = risk_scores - max_risk
        exp_risk = torch.exp(log_risk)
        
        cum_risk = torch.cumsum(exp_risk, dim=0)
        log_cum_risk = torch.log(cum_risk + 1e-10) + max_risk
        
        uncensored_likelihood = risk_scores - log_cum_risk
        
        loss = -torch.sum(uncensored_likelihood * events_sorted) / (torch.sum(events_sorted) + 1e-10)
        return loss

class FocalLoss(nn.Module):
    def __init__(self, alpha=0.25, gamma=2.0):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma

    def forward(self, inputs, targets):
        bce_loss = F.binary_cross_entropy_with_logits(inputs, targets, reduction='none')
        pt = torch.exp(-bce_loss)
        focal_loss = self.alpha * (1 - pt)**self.gamma * bce_loss
        return focal_loss.mean()

class CombinedSurvivalLoss(nn.Module):
    def __init__(self, alpha=0.5):
        super().__init__()
        self.cox_loss = CoxPHLoss()
        self.focal_loss = FocalLoss()
        self.alpha = alpha

    def forward(self, hazard_ratios, events, tte):
        l_cox = self.cox_loss(hazard_ratios, events, tte)
        l_focal = self.focal_loss(hazard_ratios, events)
        
        return self.alpha * l_cox + (1 - self.alpha) * l_focal
