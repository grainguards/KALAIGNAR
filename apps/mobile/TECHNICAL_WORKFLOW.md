# Kala Setu: Technical Architecture & Workflow

This document outlines the technical workflow and data architecture for the Kala Setu platform, illustrating how the mobile frontend, AI services, and backend systems interact across the three distinct user roles.

## System Architecture Diagram

```mermaid
flowchart TD
    %% Styling
    classDef client fill:#0F766E,stroke:#042F2E,stroke-width:2px,color:#fff,font-weight:bold
    classDef ai fill:#C36F50,stroke:#7C2D12,stroke-width:2px,color:#fff,font-weight:bold
    classDef backend fill:#1E293B,stroke:#0F172A,stroke-width:2px,color:#fff,font-weight:bold
    classDef database fill:#475569,stroke:#1E293B,stroke-width:2px,color:#fff,shape:cylinder

    %% Client Layer
    subgraph ClientLayer [Client Layer - React Native Expo]
        direction LR
        Artisan[Artisan Interface]:::client
        Buyer[Global Buyer Interface]:::client
        Govt[Govt Official Interface]:::client
    end

    %% AI Services Layer
    subgraph AIServices [AI Processing & Edge Services]
        direction LR
        NLP[Voice-to-Text & NLP]:::ai
        CV[Image Enhancement Studio]:::ai
        Predictive[Predictive Demand Engine]:::ai
    end

    %% Backend Services Layer
    subgraph BackendServices [Core Backend & API Services]
        direction TB
        CatalogAPI[Smart Cataloging Service]:::backend
        MatchEngine[Market Linkage & Matching Engine]:::backend
        BiddingAPI[Bulk Procurement & Bidding API]:::backend
        TrustAPI[Trust Score & Verification Service]:::backend
    end

    %% Data Layer
    subgraph DataLayer [Data Storage]
        direction LR
        DB_Users[(Artisan Registry)]:::database
        DB_Catalog[(Product Catalog)]:::database
        DB_Orders[(Orders & Analytics)]:::database
    end

    %% Data Flows
    Artisan -->|Voice Inputs| NLP
    Artisan -->|Raw Photos| CV
    NLP --> CatalogAPI
    CV --> CatalogAPI
    
    Artisan <-->|Real-time Pricing Insights| Predictive
    Buyer -->|Search & View Trends| Predictive
    
    CatalogAPI <--> DB_Catalog
    
    Buyer -->|Post Bulk Requirements| BiddingAPI
    Buyer <-->|Browse & Filter| MatchEngine
    
    Artisan -->|Submit Bids| BiddingAPI
    
    MatchEngine <--> DB_Catalog
    MatchEngine <--> DB_Users
    
    BiddingAPI <--> DB_Orders
    
    Govt -->|Monitor Fulfillment| BiddingAPI
    Govt <-->|Analytics Export| TrustAPI
    
    TrustAPI <--> DB_Users
    TrustAPI <--> DB_Orders
```

## Workflow Breakdown

### 1. Smart Cataloging Workflow (Artisan)
1. **Input:** An artisan takes a raw photo of their craft and uses voice notes (via the **Voice-to-Text & NLP** engine) to describe it in their local language.
2. **Processing:** The **Image Enhancement Studio** automatically removes backgrounds and adjusts lighting. The NLP engine translates and extracts key attributes (e.g., material, dimensions).
3. **Storage:** The **Smart Cataloging Service** structures this data and saves it to the **Product Catalog DB**.

### 2. Market Linkage & Bidding Workflow (Buyer & Artisan)
1. **Demand Creation:** A corporate buyer posts a bulk requirement (e.g., "500 Silk Sarees") via the **Bulk Procurement API**.
2. **Matching:** The **Market Linkage Engine** scans the **Artisan Registry** and notifies qualified artisans based on their **Trust Score** and capacity.
3. **Live Bidding:** Artisans submit their competitive bids. The buyer reviews these bids in real-time and allocates the order, which is tracked in the **Orders DB**.

### 3. Analytics & Governance Workflow (Govt)
1. **Data Aggregation:** The **Trust Score & Verification Service** continuously aggregates sales volume, fulfillment rates, and credit scores from the database.
2. **Oversight:** Government officials access read-only dashboards to monitor state-wide active procurements and export impact reports for compliance and grant allocation.
