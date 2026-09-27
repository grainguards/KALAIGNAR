// In-memory data store for hackathon demo
// No native dependencies required - works on any system

interface User {
  id: string;
  phone: string;
  name?: string;
  businessName?: string;
  language: string;
  preferred_language?: string;
  preferred_theme?: string;
  location?: string;
  craftCategory?: string;
  experienceYears?: number;
  story?: string;
  isVerified: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  userId: string;
  status: string;
  name?: string;
  price?: number;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  quantity: number;
  category?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  craftOrigin?: string;
  descriptionEn?: string;
  tags?: string;
  createdAt: string;
  images: any[];
}

class InMemoryDB {
  users: Map<string, User> = new Map();
  products: Map<string, Product> = new Map();

  // Pre-seed with demo data
  constructor() {
    const demoUser: User = {
      id: 'demo_user',
      phone: '9876543210',
      name: 'Demo Artisan',
      businessName: 'Kanchipuram Weavers',
      language: 'English',
      location: 'Kanchipuram, Tamil Nadu',
      craftCategory: 'Handloom',
      experienceYears: 15,
      story: 'Our family has been weaving traditional sarees for three generations.',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(demoUser.id, demoUser);

    // Seed demo products
    const demoProducts: Partial<Product> & { tempImage?: string }[] = [
      {
        name: 'Handwoven Kanchipuram Silk Saree',
        price: 4500,
        category: 'Textiles',
        material: 'Silk',
        descriptionEn: 'Exquisite Kanchipuram silk saree with traditional zari border and temple motifs.',
        status: 'PUBLISHED',
        tags: 'Silk, Saree, Kanchipuram, Traditional',
        tempImage: 'https://loremflickr.com/600/600/saree,india/all?lock=1'
      },
      {
        name: 'Blue Pottery Vase',
        price: 1200,
        category: 'Pottery',
        material: 'Ceramic',
        descriptionEn: 'Hand-painted blue pottery vase from Jaipur with traditional floral patterns.',
        status: 'PUBLISHED',
        tags: 'Pottery, Blue Pottery, Jaipur, Handpainted',
        tempImage: 'https://loremflickr.com/600/600/pottery,vase/all?lock=1'
      },
      {
        name: 'Bamboo Basket Set',
        price: 800,
        category: 'Bamboo Craft',
        material: 'Bamboo',
        descriptionEn: 'Set of 3 handwoven bamboo baskets from Northeast India.',
        status: 'PUBLISHED',
        tags: 'Bamboo, Basket, Handwoven, Northeast',
        tempImage: 'https://loremflickr.com/600/600/bamboo,basket/all?lock=1'
      },
      {
        name: 'Brass Diya Stand',
        price: 2500,
        category: 'Metalware',
        material: 'Brass',
        descriptionEn: 'Traditional intricately carved brass Diya stand for festive occasions.',
        status: 'PUBLISHED',
        tags: 'Brass, Metal, Lamp, Diwali',
        tempImage: 'https://loremflickr.com/600/600/brass,lamp/all?lock=1'
      },
      {
        name: 'Hand-blocked Cotton Kurti',
        price: 1500,
        category: 'Apparel',
        material: 'Cotton',
        descriptionEn: 'Vibrant block-printed cotton kurti featuring ethnic Rajasthani motifs.',
        status: 'PUBLISHED',
        tags: 'Cotton, Block Print, Kurti, Apparel',
        tempImage: 'https://loremflickr.com/600/600/kurti,india/all?lock=1'
      },
      {
        name: 'Terracotta Clay Artifacts',
        price: 650,
        category: 'Pottery',
        material: 'Terracotta',
        descriptionEn: 'Classic handcrafted terracotta art pieces in earthy tones.',
        status: 'PUBLISHED',
        tags: 'Art, Terracotta, Eco-friendly, Handpainted',
        tempImage: 'https://loremflickr.com/600/600/terracotta,pot/all?lock=1'
      },
      {
        name: 'Carved Wooden Artifact',
        price: 3200,
        category: 'Woodcraft',
        material: 'Wood',
        descriptionEn: 'Detailed hand-carved wooden decorative piece with traditional motifs.',
        status: 'DRAFT',
        tags: 'Wood, Carving, Decor',
        tempImage: 'https://loremflickr.com/600/600/wood,carving/all?lock=1'
      },
      {
        name: 'Vibrant Madhubani Painting',
        price: 5500,
        category: 'Art',
        material: 'Canvas',
        descriptionEn: 'Original Madhubani folk art painting showcasing vibrant natural dyes on canvas.',
        status: 'DRAFT',
        tags: 'Painting, Art, Madhubani, Folk',
        tempImage: 'https://loremflickr.com/600/600/painting,india/all?lock=1'
      }
    ];

    demoProducts.forEach((p, i) => {
      const id = `demo_product_${i + 1}`;
      this.products.set(id, {
        id,
        userId: 'demo_user',
        status: p.status || 'DRAFT',
        name: p.name,
        price: p.price,
        suggestedPriceMin: (p.price || 1000) * 0.8,
        suggestedPriceMax: (p.price || 1000) * 1.2,
        quantity: 5,
        category: p.category,
        material: p.material,
        descriptionEn: p.descriptionEn,
        tags: p.tags,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(), // stagger dates
        images: p.tempImage ? [{ id: `img_${i}`, url: p.tempImage }] : [],
      });
    });
  }

  // User operations
  findUserByPhone(phone: string): User | undefined {
    for (const u of this.users.values()) {
      if (u.phone === phone) return u;
    }
    return undefined;
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(phone: string): User {
    const user: User = {
      id: `user_${Date.now()}`,
      phone,
      language: 'English',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  updateUserPreferences(userId: string, prefs: { preferred_language?: string; preferred_theme?: string }): User | undefined {
    const user = this.users.get(userId) || Array.from(this.users.values())[0];
    if (user) {
      if (prefs.preferred_language) user.preferred_language = prefs.preferred_language;
      if (prefs.preferred_theme) user.preferred_theme = prefs.preferred_theme;
    }
    return user;
  }

  // Product operations
  createProduct(data: Partial<Product> & { userId: string }): Product {
    const product: Product = {
      id: `product_${Date.now()}`,
      userId: data.userId,
      status: data.status || 'DRAFT',
      name: data.name,
      price: data.price,
      suggestedPriceMin: data.suggestedPriceMin,
      suggestedPriceMax: data.suggestedPriceMax,
      quantity: data.quantity || 1,
      category: data.category,
      material: data.material,
      dimensions: data.dimensions,
      weight: data.weight,
      craftOrigin: data.craftOrigin,
      descriptionEn: data.descriptionEn,
      tags: data.tags,
      createdAt: new Date().toISOString(),
      images: [],
    };
    this.products.set(product.id, product);
    return product;
  }

  getProductsByUser(userId: string): Product[] {
    const results: Product[] = [];
    for (const p of this.products.values()) {
      if (p.userId === userId) results.push(p);
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const db = new InMemoryDB();
