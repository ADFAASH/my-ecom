// LastV2Gemini/app/admin/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import InfoIcon from './InfoIcon';
import { createPortal } from 'react-dom';
import { User } from 'lucide-react';
// Import new order API functions
import { getProducts, createProduct, updateProduct, deleteProduct, getOrders, updateOrder as updateOrderApi } from '@/lib/api'; // Renamed updateOrder to updateOrderApi to avoid conflict

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    UserPlus,
    Warehouse,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package2,
    AlertTriangle,
    CheckCircle,
    Clock,
    X,
    EyeOff, // Import EyeOff icon
    Mail,
    MapPin,
    Calendar,
    Truck,
    CheckCircle2,
    XCircle
} from 'lucide-react';

import emailjs from 'emailjs-com';


const EMAILJS_SERVICE_ID = "service_1kl50uh";
const EMAILJS_PUBLIC_KEY = "f9GmLjwlb6KdCh0Wj";
const TEMPLATE_ID = "template_mdfua6n";

const sentEmails = new Set<string>();


const sendEmail = async (
    type: 'pending' | 'confirmed' | 'cancelled' | 'shipped' | 'delivered',
    order: Order
) => {
    const emailKey = `${order.orderNumber}-${type}`;
    if (sentEmails.has(emailKey)) {
        console.warn(`⏩ Skipping duplicate email for ${emailKey}`);
        return;
    }

    sentEmails.add(emailKey);
    console.log("📨 EMAIL SENT TO:", order.email);

    try {
        const templateParams = {
            customer_name: order.customerName,
            order_id: order.orderNumber,
            order_date: new Date(order.date).toLocaleDateString(),
            order_total: `$${order.total.toFixed(2)}`,
            order_status: type,
            is_confirmed: type === 'confirmed',
            is_cancelled: type === 'cancelled',
            is_pending: type === 'pending',
            is_shipped: type === 'shipped',
            is_delivered: type === 'delivered',
            to_email: order.email
        };

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );

        console.log(`📩 Email sent for ${type} → ${order.email}`);
    } catch (error) {
        console.error(`❌ Failed to send ${type} email:`, error);
    }
};


interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    pricePer10Ml: number;
    calculatedPrices: Record<string, number>;
    sizeStocks: Record<string, number>;
    inStock: boolean;
    description: string;
    notes: {
        top: string[];
        heart: string[];
        base: string[];
    };
    reviews: number;
    sizes: string[];
    images: string[];
    isFeatured: boolean;
    sales?: number;
    isVisibleInCollection: boolean;
    _id?: string;
}

interface Order {
    orderNumber: string;
    customerName: string;
    email: string;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        size: string;
        inStock?: boolean; // Optional here as not strictly required by backend schema for items
    }>;
    total: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    date: string;
    shippingAddress: string;
    subtotal: number;
    tax: number;
    shipping: number;
    itemCount: number;
    discountAmount: number;
    shipped?: boolean;
    delivered?: boolean;
    _id?: string;
}

const parseMlFromString = (sizeString: string): number => {
    const match = sizeString.match(/(\d+)\s*ml/i);
    return match ? parseFloat(match[1]) : 0;
};

const calculatePricesForSizes = (pricePer10Ml: number, sizes: string[]): Record<string, number> => {
    const prices: Record<string, number> = {};
    sizes.forEach(sizeStr => {
        const ml = parseMlFromString(sizeStr);
        if (ml > 0 && pricePer10Ml > 0) {
            prices[sizeStr] = parseFloat(((ml / 10) * pricePer10Ml).toFixed(2));
        }
    });
    return prices;
};

const isProductOverallInStock = (sizeStocks: Record<string, number>): boolean => {
    return Object.values(sizeStocks).some(stock => stock > 0);
};

const getTotalStock = (sizeStocks: Record<string, number>): number => {
    return Object.values(sizeStocks).reduce((sum, stock) => sum + stock, 0);
};

const defaultProducts: Product[] = [
    {
        id: '1',
        name: 'Midnight Rose',
        category: 'Floral',
        price: 92.5,
        pricePer10Ml: 18.5,
        calculatedPrices: { '30ml': 55.5, '50ml': 92.5, '100ml': 185 },
        sizeStocks: { '30ml': 20, '50ml': 45, '100ml': 15 },
        reviews: 124,
        sizes: ['30ml', '50ml', '100ml'],
        images: [
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20deep%20red%20rose%20essence%2C%20elegant%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=1&orientation=portrait',
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=1b&orientation=portrait'
        ],
        description: 'An enchanting blend of Damascus rose and midnight jasmine that captures the essence of a moonlit garden. This sophisticated fragrance opens with fresh bergamot and pink pepper, revealing a heart of velvety rose petals and jasmine sambac, before settling into a warm base of sandalwood and white musk.',
        notes: {
            top: ['Bergamot', 'Pink Pepper', 'Mandarin'],
            heart: ['Damascus Rose', 'Jasmine Sambac', 'Lily of the Valley'],
            base: ['Sandalwood', 'White Musk', 'Amber']
        },
        inStock: true,
        isFeatured: true,
        isVisibleInCollection: true
    },
    {
        id: '2',
        name: 'Ocean Breeze',
        category: 'Fresh',
        price: 82.5,
        pricePer10Ml: 16.5,
        calculatedPrices: { '30ml': 49.5, '50ml': 82.5, '100ml': 165 },
        sizeStocks: { '30ml': 5, '50ml': 8, '100ml': 2 },
        reviews: 89,
        sizes: ['30ml', '50ml', '100ml'],
        images: [
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20ocean%20blue%20essence%2C%20crystal%20clear%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20fresh%20aquatic%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=2&orientation=portrait',
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20water%20droplets%2C%20crystal%20clear%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20fresh%20aquatic%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=2b&orientation=portrait'
        ],
        description: 'Fresh marine notes with hints of sea salt and citrus that transport you to pristine coastal waters. This invigorating fragrance combines aquatic accords with zesty citrus and clean marine notes for an instantly refreshing experience.',
        notes: {
            top: ['Sea Salt', 'Lemon', 'Grapefruit'],
            heart: ['Marine Accord', 'Water Lily', 'Cucumber'],
            base: ['Driftwood', 'White Amber', 'Clean Musk']
        },
        inStock: true,
        isFeatured: true,
        isVisibleInCollection: true
    },
    {
        id: '3',
        name: 'Golden Amber',
        category: 'Oriental',
        price: 97.5,
        pricePer10Ml: 19.5,
        calculatedPrices: { '30ml': 58.5, '50ml': 97.5, '100ml': 195 },
        sizeStocks: { '30ml': 0, '50ml': 0, '100ml': 0 },
        reviews: 156,
        sizes: ['30ml', '50ml', '100ml'],
        images: [
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20golden%20amber%20essence%2C%20warm%20honey%20colored%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20oriental%20luxury%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=3&orientation=portrait',
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=3b&orientation=portrait'
        ],
        description: 'Warm amber and vanilla with exotic spice undertones',
        notes: {
            top: ['Cardamom', 'Pink Pepper'],
            heart: ['Amber', 'Vanilla Orchid'],
            base: ['Sandalwood', 'White Musk', 'Amber']
        },
        inStock: false,
        isFeatured: true,
        isVisibleInCollection: true
    },
    {
        id: '4',
        name: 'Silk Garden',
        category: 'Floral',
        price: 87.5,
        pricePer10Ml: 17.5,
        calculatedPrices: { '30ml': 52.5, '50ml': 87.5, '100ml': 175 },
        sizeStocks: { '30ml': 100, '50ml': 120, '100ml': 80 },
        reviews: 203,
        sizes: ['30ml', '50ml', '100ml'],
        images: [
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20silk%20garden%20essence%2C%20delicate%20floral%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20soft%20pink%20and%20white%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=4&orientation=portrait',
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=4b&orientation=portrait'
        ],
        description: 'Delicate peony and silk tree blossom harmony',
        notes: {
            top: ['Green Apple', 'Pear'],
            heart: ['Peony', 'Rose'],
            base: ['Cedarwood', 'Musk']
        },
        inStock: true,
        isFeatured: true,
        isVisibleInCollection: true
    },
    {
        id: '5',
        name: 'Urban Noir',
        category: 'Oriental',
        price: 105,
        pricePer10Ml: 21.0,
        calculatedPrices: { '30ml': 63, '50ml': 105, '100ml': 210 },
        sizeStocks: { '30ml': 10, '50ml': 15, '100ml': 5 },
        reviews: 95,
        sizes: ['30ml', '50ml', '100ml'],
        images: [
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20dark%20noir%20essence%2C%20sleek%20black%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20urban%20sophisticated%20theme%2C%20minimalist%20white%20background%2C%20modern%20fragrance%20presentation&width=250&height=320&seq=5&orientation=portrait',
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=5b&orientation=portrait'
        ],
        description: 'Bold blend of dark woods and smoky incense',
        notes: {
            top: ['Black Pepper', 'Bergamot'],
            heart: ['Incense', 'Leather'],
            base: ['Cedar', 'Patchouli']
        },
        inStock: true,
        isFeatured: false,
        isVisibleInCollection: true
    },
    {
        id: '6',
        name: 'Citrus Dawn',
        category: 'Fresh',
        price: 77.5,
        pricePer10Ml: 15.5,
        calculatedPrices: { '30ml': 10, '50ml': 10, '100ml': 10 },
        sizeStocks: { '30ml': 10, '50ml': 10, '100ml': 10 },
        reviews: 78,
        sizes: ['30ml', '50ml', '100ml'],
        images: [
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20bright%20citrus%20essence%2C%20fresh%20orange%20and%20lemon%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20energetic%20fresh%20theme%2C%20minimalist%20white%20background%2C%20vibrant%20fragrance%20presentation&width=250&height=320&seq=6&orientation=portrait',
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=6b&orientation=portrait'
        ],
        description: 'Energizing citrus burst with morning dew freshness',
        notes: {
            top: ['Lemon', 'Mandarin'],
            heart: ['Orange Blossom', 'Green Tea'],
            base: ['White Musk', 'Cedarwood']
        },
        inStock: true,
        isFeatured: false,
        isVisibleInCollection: true
    },
    {
        id: '7',
        name: 'Velvet Orchid',
        category: 'Floral',
        price: 112.5,
        pricePer10Ml: 22.5,
        calculatedPrices: { '30ml': 67.5, '50ml': 112.5, '100ml': 225 },
        sizeStocks: { '30ml': 50, '50ml': 75, '100ml': 25 },
        reviews: 167,
        sizes: ['30ml', '50ml', '100ml'],
        images: [
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20purple%20velvet%20orchid%2C%20essence%2C%20elegant%20violet%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20luxurious%20floral%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=7&orientation=portrait',
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=7b&orientation=portrait'
        ],
        description: 'Exotic orchid petals with velvety smooth finish',
        notes: {
            top: ['Rum', 'Honey'],
            heart: ['Black Orchid', 'Velvet Flower'],
            base: ['Vanilla', 'Sandalwood']
        },
        inStock: true,
        isFeatured: false,
        isVisibleInCollection: true
    },
    {
        id: '8',
        name: 'Mystic Woods',
        category: 'Oriental',
        price: 95,
        pricePer10Ml: 19.0,
        calculatedPrices: { '30ml': 57, '50ml': 95, '100ml': 190 },
        sizeStocks: { '30ml': 5, '50ml': 12, '100ml': 3 },
        reviews: 134,
        sizes: ['30ml', '50ml', '100ml'],
        images: [
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20mystic%20forest%20essence%2C%20earthy%20wood%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20mysterious%20natural%20theme%2C%20minimalist%20white%20background%2C%20organic%20fragrance%20presentation&width=250&height=320&seq=8&orientation=portrait',
            'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=8b&orientation=portrait'
        ],
        description: 'Mysterious forest blend with ancient cedar and moss',
        notes: {
            top: ['Pine', 'Juniper'],
            heart: ['Cedarwood', 'Moss'],
            base: ['Patchouli', 'Amber']
        },
        inStock: true,
        isFeatured: false,
        isVisibleInCollection: true
    }
];

// -----------------------------------------------------
// EXTRACTED ADDPRODUCTMODAL COMPONENT
// This component should be defined OUTSIDE of the AdminDashboard function
// -----------------------------------------------------
const AddProductModal = ({
    newProduct,
    setNewProduct,
    rawSizesInput,
    setRawSizesInput,
    handleAddProduct,
    handleUpdateProduct,
    handleFormChange,
    editingProduct,
    setEditingProduct,
    setShowAddProductModal
}: {
    newProduct: Product;
    setNewProduct: React.Dispatch<React.SetStateAction<Product>>;
    rawSizesInput: string;
    setRawSizesInput: React.Dispatch<React.SetStateAction<string>>;
    handleAddProduct: (e: React.FormEvent, sizeStocksData: Record<string, number>) => void; // Updated signature
    handleUpdateProduct: (e: React.FormEvent, sizeStocksData: Record<string, number>) => void; // Updated signature
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, isEditing: boolean) => void;
    editingProduct: Product | null;
    setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
    setShowAddProductModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    // Local state to manage individual stock inputs
    const [currentSizeStocksInput, setCurrentSizeStocksInput] = useState<Record<string, number>>({});

    // Parse rawSizesInput to get a list of current sizes for dynamic stock inputs
    const currentSizes = rawSizesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    // Effect to initialize currentSizeStocksInput when product changes (for editing) or sizes change
    useEffect(() => {
        // Use editingProduct's sizeStocks or initialize new for current sizes
        const initialStocks: Record<string, number> = {};
        const sourceStocks = editingProduct?.sizeStocks || {};

        currentSizes.forEach(size => {
            initialStocks[size] = sourceStocks[size] || 0;
        });
        setCurrentSizeStocksInput(initialStocks);
    }, [editingProduct, rawSizesInput]); // Depend on editingProduct & rawSizesInput

    // Handle change for individual stock input fields
    const handleIndividualStockChange = useCallback((size: string, value: string) => {
        const stockValue = parseInt(value);
        setCurrentSizeStocksInput(prevStocks => ({
            ...prevStocks,
            [size]: isNaN(stockValue) ? 0 : Math.max(0, stockValue) // Ensure non-negative number
        }));
    }, []);

    // Wrapper function to pass currentSizeStocksInput to parent's submit handlers
    const handleActualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            handleUpdateProduct(e, currentSizeStocksInput);
        } else {
            handleAddProduct(e, currentSizeStocksInput);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <p className="text-gray-500 mt-1">{editingProduct ? 'Update product information' : 'Create a new perfume product'}</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowAddProductModal(false);
                            setEditingProduct(null);
                            setNewProduct({
                                id: '', name: '', category: 'Floral', price: 0, pricePer10Ml: 0, calculatedPrices: {}, sizeStocks: {},
                                description: '', notes: { top: [], heart: [], base: [] }, reviews: 0, sizes: ['50ml', '100ml'], images: [], isFeatured: false, inStock: true, isVisibleInCollection: true
                            });
                            setRawSizesInput('');
                            setCurrentSizeStocksInput({}); // Reset local stock input state
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-50" />
                    </button>
                </div>

                <form onSubmit={handleActualSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={editingProduct ? editingProduct.name : newProduct.name}
                                onChange={(e) => handleFormChange(e, !!editingProduct)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter product name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border bg-white text-left pr-8 focus:ring-indigo-500 focus:border-indigo-500"
                                    onClick={(e) => {
                                        const select = e.currentTarget.nextElementSibling as HTMLElement;
                                        select.classList.toggle('hidden');
                                    }}
                                >
                                    {editingProduct ? editingProduct.category : newProduct.category}
                                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2"></i>
                                </button>
                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg hidden">
                                    {['Floral', 'Fresh', 'Oriental', 'Gourmand', 'Woody'].map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            className="block w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                            onClick={(e) => {
                                                const targetState = editingProduct ? editingProduct : newProduct;
                                                const setStateFn = editingProduct ? setEditingProduct : setNewProduct;
                                                setStateFn({ ...targetState, category: category });
                                                const dropdown = e.currentTarget.closest('.absolute.z-10') as HTMLElement;
                                                dropdown.classList.add('hidden');
                                            }}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={editingProduct ? editingProduct.description : newProduct.description}
                            onChange={(e) => handleFormChange(e, !!editingProduct)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Product description..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price Per 10ML ($)</label>
                            <input
                                type="number"
                                name="pricePer10Ml"
                                value={editingProduct ? editingProduct.pricePer10Ml : newProduct.pricePer10Ml}
                                onChange={(e) => handleFormChange(e, !!editingProduct)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma-separated, e.g., 30ml, 50ml, 100ml)</label>
                            <input
                                type="text"
                                name="sizes"
                                value={rawSizesInput}
                                onChange={(e) => handleFormChange(e, !!editingProduct)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 30ml, 50ml, 100ml"
                            />
                        </div>
                    </div>

                    {/* DYNAMIC STOCK INPUTS */}
                    {currentSizes.length > 0 && (
                        <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">Stock per Size</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {currentSizes.map(size => (
                                    <div key={size}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock for {size}</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={currentSizeStocksInput[size] || 0}
                                            onChange={(e) => handleIndividualStockChange(size, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Drag & drop images here or click to browse</p>
                            <button type="button" className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                Choose Files
                            </button>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-700 mb-2">Image URLs (comma-separated)</p>
                        <input
                            type="text"
                            name="images"
                            value={editingProduct?.images?.join(', ') || newProduct.images.join(', ')}
                            onChange={(e) => handleFormChange(e, !!editingProduct)}
                            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">Leave URLs blank to auto-generate based on category.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Top Notes</label>
                            <input
                                type="text"
                                name="notesTop"
                                value={editingProduct?.notes?.top.join(', ') || newProduct.notes.top.join(', ')}
                                onChange={(e) => handleFormChange(e, !!editingProduct)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Bergamot, Pink Pepper"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Heart Notes</label>
                            <input
                                type="text"
                                name="notesHeart"
                                value={editingProduct?.notes?.heart.join(', ') || newProduct.notes.heart.join(', ')}
                                onChange={(e) => handleFormChange(e, !!editingProduct)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Damascus Rose, Jasmine"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Base Notes</label>
                            <input
                                type="text"
                                name="notesBase"
                                value={editingProduct?.notes?.base.join(', ') || newProduct.notes.base.join(', ')}
                                onChange={(e) => handleFormChange(e, !!editingProduct)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Sandalwood, White Musk"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="featured"
                            name="isFeatured"
                            checked={editingProduct ? editingProduct.isFeatured : newProduct.isFeatured}
                            onChange={(e) => handleFormChange(e, !!editingProduct)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="featured" className="ml-2 text-sm text-gray-700">Mark as Featured Product</label>
                    </div>

                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddProductModal(false);
                                setEditingProduct(null);
                                setNewProduct({
                                    id: '', name: '', category: 'Floral', price: 0, pricePer10Ml: 0, calculatedPrices: {}, sizeStocks: {},
                                    description: '', notes: { top: [], heart: [], base: [] }, reviews: 0, sizes: ['50ml', '100ml'], images: [], isFeatured: false, inStock: true, isVisibleInCollection: true
                                });
                                setRawSizesInput('');
                                setCurrentSizeStocksInput({}); // Reset local stock input state
                            }}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// -----------------------------------------------------

// NEW RestockModal component
const RestockModal = ({
    product,
    restockAmount,
    setRestockAmount,
    handleConfirmRestock,
    setShowRestockModal,
    selectedRestockSize,
    setSelectedRestockSize
}: {
    product: Product;
    restockAmount: number;
    setRestockAmount: React.Dispatch<React.SetStateAction<number>>;
    handleConfirmRestock: (productId: string, size: string, amount: number) => void;
    setShowRestockModal: React.Dispatch<React.SetStateAction<boolean>>;
    selectedRestockSize: string;
    setSelectedRestockSize: React.Dispatch<React.SetStateAction<string>>;
}) => {
    useEffect(() => {
        if (product.sizes && product.sizes.length > 0 && !selectedRestockSize) {
            setSelectedRestockSize(product.sizes[0]);
        }
        if (selectedRestockSize && !product.sizes.includes(selectedRestockSize)) {
            setSelectedRestockSize(product.sizes.length > 0 ? product.sizes[0] : '');
        }
    }, [product.sizes, selectedRestockSize, setSelectedRestockSize]);

    const currentStockForSelectedSize = product.sizeStocks[selectedRestockSize] || 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Restock {product.name}</h2>
                        <p className="text-gray-500 mt-1">Current Stock (Selected Size): {currentStockForSelectedSize}</p>
                    </div>
                    <button
                        onClick={() => setShowRestockModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                        <select
                            value={selectedRestockSize}
                            onChange={(e) => setSelectedRestockSize(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {product.sizes.map(size => (
                                <option key={size} value={size}>{size} (Current: {product.sizeStocks[size] || 0})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Add</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 0))} // Ensure positive integer
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 50"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={() => setShowRestockModal(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => handleConfirmRestock(product.id, selectedRestockSize, restockAmount)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Confirm Restock
                    </button>
                </div>
            </div>
        </div>
    );
};

// Place this at the top-level, after imports and before the AdminDashboard function
const sampleUsers = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Administrator',
        status: 'Active',
        lastLogin: '2024-06-01 10:23',
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Editor',
        status: 'Inactive',
        lastLogin: '2024-05-28 14:12',
    },
    {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        role: 'Moderator',
        status: 'Active',
        lastLogin: '2024-06-02 09:45',
    },
];

export default function AdminDashboard() {
    const [currentView, setCurrentView] = useState<'products' | 'orders' | 'dashboard' | 'customers' | 'inventory' | 'analytics' | 'users' | 'settings'>('dashboard');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [rawSizesInput, setRawSizesInput] = useState('');
    const [showAddProductModal, setShowAddProductModal] = useState(false);

    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockingProductId, setRestockingProductId] = useState<string | null>(null);
    const [restockAmount, setRestockAmount] = useState<number>(1);
    const [selectedRestockSize, setSelectedRestockSize] = useState<string>('');

    // Restore newProduct and setNewProduct state
    const [newProduct, setNewProduct] = useState<Product>({
        id: '',
        name: '',
        category: 'Floral',
        price: 0,
        pricePer10Ml: 0,
        calculatedPrices: {},
        sizeStocks: {},
        inStock: true,
        description: '',
        notes: {
            top: [],
            heart: [],
            base: []
        },
        reviews: 0,
        sizes: ['50ml', '100ml'],
        images: [],
        isFeatured: false,
        isVisibleInCollection: true // Initialize as visible
    });

    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'pending' | 'confirmed' | 'cancelled'>('All');

    // 1. Add state for order details modal
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        getProducts()
          .then(fetchedProducts => {
            // Map MongoDB's _id to frontend's id for consistency
            const sanitizedProducts = fetchedProducts.map((p: any) => ({
                ...p,
                id: p._id // Ensure using MongoDB's _id as the primary ID on frontend
            }));
            setProducts(sanitizedProducts);
          })
          .catch(err => {
            console.error('Failed to fetch products:', err);
            setProducts([]);
          });

        // Fetch orders on mount
        getOrders()
          .then(fetchedOrders => {
            const sanitizedOrders = fetchedOrders.map((o: any) => ({
              ...o,
              date: typeof o.date === 'string' ? o.date : new Date(o.date).toISOString(),
            }));
            setOrders(sanitizedOrders);
          })
          .catch(err => {
            console.error('Failed to fetch orders:', err);
            setOrders([]);
          });

    }, []);

    // NOTE: Removed localStorage.setItem for products and orders as they are now managed via API

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
            setIsAuthenticated(true);
            setCurrentView('dashboard'); // Redirect to dashboard on successful login
        } else {
            alert('Invalid credentials');
        }
    };

    const processSizesInput = (inputString: string): string[] => {
        const parts = inputString.split(',').map(s => s.trim()).filter(s => s.length > 0);
        return parts.map(part => {
            if (!isNaN(parseFloat(part)) && isFinite(Number(part))) {
                return `${part}ml`;
            }
            return part;
        });
    };

    const handleAddProduct = async (e: React.FormEvent, currentSizeStocksInput: Record<string, number>) => {
        e.preventDefault();
        const categoryLower = newProduct.category.toLowerCase();
        const generatedImageUrl = 'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20' + categoryLower + '%20scent%20premium%20packaging%20elegant%20design%20minimalist%20background%20sophisticated&width=300&height=400&orientation=portrait';

        const finalSizes = processSizesInput(newProduct.sizes.join(','));
        const calculatedPrices = calculatePricesForSizes(newProduct.pricePer10Ml, finalSizes);
        const overallInStock = isProductOverallInStock(currentSizeStocksInput);

        const sortedSizes = [...finalSizes].sort((a, b) => parseMlFromString(a) - parseMlFromString(b));
        const smallestSizePrice = sortedSizes.length > 0 && Object.keys(calculatedPrices).length > 0
            ? calculatedPrices[sortedSizes[0]]
            : 0;

        let images = [...newProduct.images];
        if (images.length === 0 || images.every(img => img.trim() === '')) {
            images = [generatedImageUrl];
        } else if (images[0].trim() === '') {
            images.shift();
        }

        const productForm = { // No need for id: `prod-${Date.now()}` here, backend assigns _id
            ...newProduct,
            images: images,
            price: smallestSizePrice,
            calculatedPrices: calculatedPrices,
            sizes: finalSizes,
            sizeStocks: currentSizeStocksInput,
            inStock: overallInStock,
            isVisibleInCollection: true // New products are visible by default
        };

        // Optional but recommended: check required fields before proceeding
        if (!productForm.name || !productForm.price) {
            alert("Please fill in required fields like name and price.");
            return;
        }

        const sanitizedProduct = {
            ...productForm,
            price: Number(productForm.price) || 0,
            pricePer10Ml: Number(productForm.pricePer10Ml) || 0,
            reviews: Number(productForm.reviews) || 0,
            sizeStocks: Object.fromEntries(
                Object.entries(productForm.sizeStocks || {}).map(([size, stock]) => [
                    size,
                    Number(stock) || 0,
                ])
            ),
        };

        try {
            const createdProductFromBackend = await createProduct(sanitizedProduct);
            setProducts(prevProducts => [...prevProducts, { ...createdProductFromBackend, id: createdProductFromBackend._id! }]);
            setNewProduct({
                id: '', name: '', category: 'Floral', price: 0, pricePer10Ml: 0, calculatedPrices: {}, sizeStocks: {},
                description: '', notes: { top: [], heart: [], base: [] }, reviews: 0, sizes: ['50ml', '100ml'], images: [], isFeatured: false, inStock: true, isVisibleInCollection: true
            });
            setRawSizesInput('');
            setCurrentView('products');
            setShowAddProductModal(false);
        } catch (error) {
            console.error('Failed to add product:', error);
            alert('Failed to add product. Please check console for details.');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product. Please check console for details.');
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setNewProduct({
            ...product,
            notes: { top: [...product.notes.top], heart: [...product.notes.heart], base: [...product.notes.base] },
            sizeStocks: product.sizeStocks && typeof product.sizeStocks === 'object' ? { ...product.sizeStocks } : {}
        });
        setRawSizesInput(product.sizes.join(', '));
        setShowAddProductModal(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent, currentSizeStocksInput: Record<string, number>) => {
        e.preventDefault();
        if (editingProduct) {
            const finalSizes = processSizesInput(rawSizesInput);
            const calculatedPrices = calculatePricesForSizes(editingProduct.pricePer10Ml, finalSizes);
            const overallInStock = isProductOverallInStock(currentSizeStocksInput);

            const sortedSizes = [...finalSizes].sort((a, b) => parseMlFromString(a) - parseMlFromString(b));
            const smallestSizePrice = sortedSizes.length > 0 && Object.keys(calculatedPrices).length > 0
                ? calculatedPrices[sortedSizes[0]]
                : editingProduct.price;

            let images = [...editingProduct.images];
            const categoryLower = editingProduct.category.toLowerCase();
            const generatedImageUrl = 'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20' + categoryLower + '%20scent%20premium%20packaging%20elegant%20design%20minimalist%20background%20sophisticated&width=300&height=400&orientation=portrait';

            if (images.length === 0 || images.every(img => img.trim() === '')) {
                images = [generatedImageUrl];
            } else if (images[0].trim() === '') {
                images.shift();
            }

            const updatedProductData: Product = {
                ...editingProduct,
                price: smallestSizePrice,
                calculatedPrices: calculatedPrices,
                sizes: finalSizes,
                images: images,
                sizeStocks: currentSizeStocksInput,
                inStock: overallInStock,
                isFeatured: editingProduct.isFeatured,
                isVisibleInCollection: editingProduct.isVisibleInCollection
            };

            try {
                const updatedProductFromBackend = await updateProduct(editingProduct.id, updatedProductData);
                setProducts(prevProducts =>
                    prevProducts.map(p =>
                        p.id === updatedProductFromBackend._id
                            ? { ...updatedProductFromBackend, id: updatedProductFromBackend._id! }
                            : p
                    )
                );
                setEditingProduct(null);
                setNewProduct({
                    id: '', name: '', category: 'Floral', price: 0, pricePer10Ml: 0, calculatedPrices: {}, sizeStocks: {},
                    description: '', notes: { top: [], heart: [], base: [] }, reviews: 0, sizes: ['50ml', '100ml'], images: [], isFeatured: false, inStock: true, isVisibleInCollection: true
                });
                setRawSizesInput('');
                setShowAddProductModal(false);
                setCurrentView('products');
            } catch (error) {
                console.error('Failed to update product:', error);
                alert('Failed to update product. Please check console for details.');
            }
        }
    };


    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        isEditing: boolean
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        if (name === 'sizes') {
            setRawSizesInput(value);
            return;
        }

        const targetProductState = isEditing ? (editingProduct as Product) : newProduct;
        let updatedProductState: Product = { ...targetProductState };

        if (!targetProductState) return;

        if (name === "pricePer10Ml" || name === "reviews") {
            (updatedProductState as any)[name] = parseFloat(value);
        } else if (name === 'isFeatured') {
            (updatedProductState as any)[name] = checked;
        }
        else if (type === 'checkbox' || type === 'radio') {
        } else if (name.startsWith('notes')) {
            const noteType = name.replace('notes', '').toLowerCase() as 'top' | 'heart' | 'base';
            const parsedNotes = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            updatedProductState.notes = { ...updatedProductState.notes, [noteType]: parsedNotes };
        } else if (name === 'images') {
            const parsedImages = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            updatedProductState.images = parsedImages;
        } else {
            (updatedProductState as any)[name] = value;
        }

        if (isEditing) {
            setEditingProduct(updatedProductState);
        } else {
            setNewProduct(updatedProductState);
        }
    };

    const handleOpenRestockModal = (productId: string) => {
        const productToRestock = products.find(p => p.id === productId);
        if (productToRestock) {
            setRestockingProductId(productId);
            setSelectedRestockSize(productToRestock.sizes.length > 0 ? productToRestock.sizes[0] : '');
            setRestockAmount(1);
            setShowRestockModal(true);
        }
    };

    const handleConfirmRestock = (productId: string, size: string, amount: number) => {
        if (productId && size && amount > 0) {
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === productId
                        ? {
                            ...product,
                            sizeStocks: {
                                ...product.sizeStocks,
                                [size]: (product.sizeStocks[size] || 0) + amount
                            },
                            inStock: isProductOverallInStock({ ...product.sizeStocks, [size]: (product.sizeStocks[size] || 0) + amount })
                        }
                        : product
                )
            );
            setShowRestockModal(false);
            setRestockingProductId(null);
            setRestockAmount(1);
            setSelectedRestockSize('');
        } else {
            alert("Please select a size and enter a valid restock amount.");
        }
    };

    const handleToggleVisibility = async (productId: string) => { // Made async
        const productToToggle = products.find(p => p.id === productId);
        if (!productToToggle || !productToToggle._id) return; // Ensure _id is present

        const updatedVisibility = !productToToggle.isVisibleInCollection;
        const updatedProductData = {
            isVisibleInCollection: updatedVisibility // Only send the changed field
        };

        try {
            const res = await updateProduct(productToToggle._id, updatedProductData); // Use _id for API call
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product._id === res._id
                        ? { ...res, id: res._id! } // Update with data from backend
                        : product
                )
            );
            console.log(`Product ${productToToggle.name} (${productId}) visibility toggled to ${updatedVisibility}`);
        } catch (error) {
            console.error(`Failed to toggle visibility for product ${productId}:`, error);
            alert(`Failed to toggle visibility for ${productToToggle.name}. Please try again.`);
        }
    };

    // UPDATED: handleToggleShipped function logic
    const handleToggleShipped = async (orderNumber: string) => {
        const orderToUpdate = orders.find(o => o.orderNumber === orderNumber);
        if (!orderToUpdate || !orderToUpdate._id) return;

        const newShippedStatus = !orderToUpdate.shipped;
        const updatedOrderData = {
            shipped: newShippedStatus,
            delivered: newShippedStatus ? orderToUpdate.delivered : false // If unshipped, delivered also becomes false
        };

        try {
            const updatedOrderFromBackend = await updateOrderApi(orderToUpdate._id, updatedOrderData);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === updatedOrderFromBackend._id
                        ? { ...updatedOrderFromBackend }
                        : order
                )
            );
            if (newShippedStatus && updatedOrderFromBackend.status === 'confirmed') {
                sendEmail('shipped', { ...updatedOrderFromBackend, shipped: newShippedStatus });
            }
        } catch (error) {
            console.error(`Failed to toggle shipped status for order ${orderNumber}:`, error);
            alert(`Failed to update order ${orderNumber}. Please try again.`);
        }
    };

    // NEW: handleToggleDelivered function
    const handleToggleDelivered = async (orderNumber: string) => {
        const orderToUpdate = orders.find(o => o.orderNumber === orderNumber);
        if (!orderToUpdate || !orderToUpdate._id) return;

        if (!orderToUpdate.shipped) {
            alert('Order must be marked as "Shipped" before it can be "Delivered".');
            return;
        }

        const newDeliveredStatus = !orderToUpdate.delivered;
        const updatedOrderData = {
            delivered: newDeliveredStatus
        };

        try {
            const updatedOrderFromBackend = await updateOrderApi(orderToUpdate._id, updatedOrderData);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === updatedOrderFromBackend._id
                        ? { ...updatedOrderFromBackend }
                        : order
                )
            );
            if (newDeliveredStatus) {
                sendEmail('delivered', updatedOrderFromBackend);
            }
        } catch (error) {
            console.error(`Failed to toggle delivered status for order ${orderNumber}:`, error);
            alert(`Failed to update order ${orderNumber}. Please try again.`);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock':
            case 'Active':
            case 'Delivered':
                return 'text-green-600 bg-green-100';
            case 'Low Stock':
            case 'Processing':
                return 'text-yellow-600 bg-yellow-100';
            case 'Out of Stock':
            case 'Inactive':
            case 'Pending':
                return 'text-red-600 bg-red-100';
            case 'Shipped':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <div className="flex items-center mt-2">
                        {change > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                        <span className="text-gray-500 text-sm ml-1">vs last month</span>
                    </div>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    type NavigationItem = {
        id: string;
        label: string;
        icon: React.ComponentType<any>;
        badge?: string;
    };

    const inventoryLowStockCount = products.filter(p =>
        p.sizeStocks && typeof p.sizeStocks === 'object' &&
        Object.values(p.sizeStocks).some(s => s > 0 && s <= 10)
    ).length;
    const inventoryOutOfStockCount = products.filter(p =>
        p.sizeStocks && typeof p.sizeStocks === 'object' &&
        Object.values(p.sizeStocks).every(s => s === 0)
    ).length;
    const inventoryAlertCount = inventoryLowStockCount + inventoryOutOfStockCount;


    const navigation: NavigationItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package, badge: String(products.length) },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: String(orders.filter(o => o.status === 'pending').length) },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'inventory', label: 'Inventory', icon: Warehouse, badge: String(inventoryAlertCount) },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: UserPlus },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0).toFixed(2);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const ordersThisMonth = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;

    const newCustomersThisMonth = Array.from(
        new Set(
            orders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            }).map(order => order.email)
        )
    ).filter(email => {
        const customerOrders = orders.filter(order => order.email === email);
        const earliestOrderDate = customerOrders.length > 0
            ? new Date(Math.min(...customerOrders.map(o => new Date(o.date).getTime())))
            : null;
        return earliestOrderDate && earliestOrderDate.getMonth() === currentMonth && earliestOrderDate.getFullYear() === currentYear;
    }).length;

    const productsWithSales = products.map(p => ({
        ...p,
        sales: orders.reduce((sum, order) => sum + order.items.filter(item => item.id.startsWith(p.id)).reduce((itemSum, item) => itemSum + item.quantity, 0), 0)
    })).sort((a, b) => (b.sales || 0) - (a.sales || 0));

    const pendingOrderCount = orders.filter(o => o.status === 'pending').length;
    const confirmedOrderCount = orders.filter(o => o.status === 'confirmed').length;
    const cancelledOrderCount = orders.filter(o => o.status === 'cancelled').length;

    const outOfStockProducts = products.filter(
        p =>
            p.sizeStocks &&
            typeof p.sizeStocks === 'object' &&
            Object.values(p.sizeStocks).every(s => s === 0)
    );
    const lowStockProducts = products.filter(
        p =>
            p.sizeStocks &&
            typeof p.sizeStocks === 'object' &&
            Object.values(p.sizeStocks).some(s => s > 0 && s <= 10) &&
            !Object.values(p.sizeStocks).every(s => s === 0)
    );

    const uniqueCustomers = Array.from(new Set(orders.map(order => order.email)))
        .map(email => {
            const customerOrders = orders.filter(order => order.email === email);
            const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
            const latestOrder = customerOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            const lastOrderDate = latestOrder ? latestOrder.date : 'N/A';
            const customerName = latestOrder ? latestOrder.customerName : email;

            return {
                id: email,
                name: customerName,
                email: email,
                orders: customerOrders.length,
                totalSpent: totalSpent,
                lastOrder: lastOrderDate,
                status: 'Active'
            };
        });

    const calculatePseudoChange = useCallback((currentValue: number | string): number => {
        const numValue = parseFloat(currentValue as string);
        if (numValue > 0) {
            const pseudoPreviousValue = Math.max(1, numValue * 0.9);
            return parseFloat((((numValue - pseudoPreviousValue) / pseudoPreviousValue) * 100).toFixed(1));
        } else if (numValue === 0) {
            return -100;
        }
        return 0;
    }, []);


    // New OrderDetailsModal component (replacing the old one)
    const OrderDetailsModal = ({
        order,
        onClose,
    }: {
        order: Order;
        onClose: () => void;
    }) => {
        // Create a ref for the content to be printed
        const printContentRef = useRef<HTMLDivElement>(null);

        const handlePrint = () => {
            if (printContentRef.current) {
                const printWindow = window.open('', '', 'height=600,width=800');
                if (printWindow) {
                    printWindow.document.write('<html><head><title>Order Print</title>');
                    printWindow.document.write('<style>');
                    printWindow.document.write(`
                        body { font-family: sans-serif; margin: 20px; }
                        .order-print-container { padding: 20px; border: 1px solid #eee; border-radius: 8px; }
                        h1, h2, h3 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .flex { display: flex; }
                        .items-center { align-items: center; }
                        .justify-between { justify-content: space-between; }
                        .gap-2 { gap: 8px; }
                        .mb-0\\.5 { margin-bottom: 2px; }
                        .text-xs { font-size: 0.75rem; }
                        .text-sm { font-size: 0.875rem; }
                        .text-base { font-size: 1rem; }
                        .text-lg { font-size: 1.125rem; }
                        .font-semibold { font-weight: 600; }
                        .font-medium { font-weight: 500; }
                        .font-bold { font-weight: 700; }
                        .rounded-full { border-radius: 9999px; }
                        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                        .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
                        .inline-flex { display: inline-flex; }
                        .bg-gray-100 { background-color: #f3f4f6; }
                        .text-gray-700 { color: #4b5563; }
                        .bg-emerald-500\/20 { background-color: rgba(16, 185, 129, 0.2); }
                        .text-emerald-300 { color: #6ee7b7; }
                        .border-emerald-500\/30 { border-color: rgba(16, 185, 129, 0.3); }
                        .bg-orange-500\/20 { background-color: rgba(249, 115, 22, 0.2); }
                        .text-orange-300 { color: #fdba74; }
                        .border-orange-500\/30 { border-color: rgba(249, 115, 22, 0.3); }
                        .text-white\/80 { color: rgba(255, 255, 255, 0.8); }
                        .text-white\/60 { color: rgba(255, 255, 255, 0.6); }
                        .bg-blue-100 { background-color: #dbeafe; }
                        .text-blue-600 { color: #2563eb; }
                        .bg-purple-100 { background-color: #ede9fe; }
                        .text-purple-600 { color: #9333ea; }
                        .bg-emerald-100 { background-color: #d1fae5; }
                        .text-emerald-600 { color: #059669; }
                    `);
                    printWindow.document.write('</style>');
                    printWindow.document.write('</head><body>');
                    printWindow.document.write('<div class="order-print-container">');
                    printWindow.document.write(printContentRef.current.innerHTML);
                    printWindow.document.write('</div>');
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }
            }
        };


        const getStatusIcon = (status: string) => {
            switch (status) {
                case 'pending':
                    return <Clock className="h-4 w-4" />;
                case 'confirmed':
                    return <CheckCircle2 className="h-4 w-4" />;
                case 'shipped':
                    return <Truck className="h-4 w-4" />;
                case 'delivered':
                    return <CheckCircle className="h-4 w-4" />;
                case 'cancelled':
                    return <XCircle className="h-4 w-4" />;
                default:
                    return <Clock className="h-4 w-4" />;
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-t-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-t-2xl"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Order Details</h2>
                                        <p className="text-white/80 text-base font-medium">{order.orderNumber}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                    order.status === 'confirmed'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                    }`}>
                                    {getStatusIcon(order.status)}
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                <span className="text-white/60 text-xs">•</span>
                                <span className="text-white/80 text-xs">{new Date(order.date).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div ref={printContentRef} className="p-6 space-y-6 bg-gray-50">
                        {/* Customer Information Card */}
                        <div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900">Customer Information</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center mt-0.5">
                                                    <User className="h-3 w-3 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Customer Name</p>
                                                    <p className="text-sm text-gray-900 font-medium">{order.customerName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center mt-0.5">
                                                    <Mail className="h-3 w-3 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Email Address</p>
                                                    <p className="text-sm text-gray-900 font-medium break-all">{order.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center mt-0.5">
                                                    <MapPin className="h-3 w-3 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Shipping Address</p>
                                                    <p className="text-sm text-gray-900 font-medium leading-normal">{order.shippingAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center mt-0.5">
                                                    <Calendar className="h-3 w-3 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Order Date</p>
                                                    <p className="text-sm text-gray-900 font-medium">{new Date(order.date).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Card */}
                        <div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <Package className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900">Order Items</h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Product</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Size</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Qty</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Price</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, index) => (
                                                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                    {/* FIX: Ensure no whitespace immediately inside <td> tags */}
                                                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex items-center justify-center">
                                                                {(() => {
                                                                    const product = products.find(p => p.id === item.id);
                                                                    return Array.isArray(product?.images) && product.images.length > 0 && typeof product.images[0] === 'string' ? (
                                                                        <img
                                                                            src={product.images[0]}
                                                                            alt={product.name || 'Image'}
                                                                            className="w-10 h-10 rounded object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                                                            N/A
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                                                        </div></td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            {item.size}
                                                        </span></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center"><span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                            {item.quantity}
                                                        </span></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                                                        ${item.price.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div>
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-purple-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Order Summary</h3>
      </div>
    </div>

    {/* Body */}
    <div className="p-5">
      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 font-medium text-sm">Subtotal</span>
          <span className="text-gray-900 font-semibold text-sm">${order.subtotal.toFixed(2)}</span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 font-medium text-sm">Tax</span>
          <span className="text-gray-900 font-semibold text-sm">${order.tax.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 font-medium text-sm">Shipping</span>
          <span className="text-gray-900 font-semibold text-sm">${order.shipping.toFixed(2)}</span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 font-medium text-sm">Discount</span>
          <span className="text-gray-900 font-semibold text-sm">-${order.discountAmount.toFixed(2)}</span>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

                    </div> {/* End printContentRef container */}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                            Print Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Revenue"
                                value={`$${totalRevenue}`}
                                change={calculatePseudoChange(parseFloat(totalRevenue))}
                                icon={DollarSign}
                                color="bg-green-500"
                            />
                            <StatCard
                                title="Orders This Month"
                                value={ordersThisMonth}
                                change={calculatePseudoChange(ordersThisMonth)}
                                icon={ShoppingCart}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Products"
                                value={totalProducts}
                                change={calculatePseudoChange(totalProducts)}
                                icon={Package2}
                                color="bg-purple-500"
                            />
                            <StatCard
                                title="Customers"
                                value={uniqueCustomers.length}
                                change={calculatePseudoChange(uniqueCustomers.length)}
                                icon={Users}
                                color="bg-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                                <div className="space-y-4">
                                    {orders.slice(0, 4).map(order => (
                                        <div key={order.orderNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                                                <p className="text-sm text-gray-500">{order.customerName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                                                    order.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : order.status === 'confirmed'
                                                            ? 'bg-green-100 text-green-600'
                                                            : order.status === 'cancelled'
                                                                ? 'bg-red-100 text-red-600'
                                                                : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                                <div className="space-y-4">
                                    {[...lowStockProducts, ...outOfStockProducts].map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {Object.values(product.sizeStocks).every(s => s === 0) ? 'Out of Stock' : 'Low Stock'}
                                                        {` (${getTotalStock(product.sizeStocks)} units)`}
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'products':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                            <p className="mt-1 text-gray-500">Manage your perfume inventory</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={""}
                                                onChange={() => { }}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                            <Filter className="w-4 h-4" />
                                            <span>Filter</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => {
                                                setShowAddProductModal(true);
                                                setEditingProduct(null);
                                                setNewProduct({
                                                    id: '', name: '', category: 'Floral', price: 0, pricePer10Ml: 0, calculatedPrices: {}, sizeStocks: {},
                                                    description: '', notes: { top: [], heart: [], base: [] }, reviews: 0, sizes: ['50ml', '100ml'], images: [], isFeatured: false, inStock: true, isVisibleInCollection: true
                                                });
                                                setRawSizesInput('');
                                            }}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span className="font-semibold">Add New Product</span>
                                        </button>
                                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                            <Download className="w-4 h-4" />
                                            <span>Export</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/10ML</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visibility</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.map((product, idx) => (
                                            <tr key={`${product.id}-${idx}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                                                    {product.images && product.images.length > 0 && (
                                                <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                            )}
                                                    <span className="font-semibold text-gray-900">{product.name}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.pricePer10Ml.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{getTotalStock(product.sizeStocks)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                                                        getTotalStock(product.sizeStocks) === 0
                                                            ? getStatusColor('Out of Stock')
                                                            : getTotalStock(product.sizeStocks) <= 10
                                                                ? getStatusColor('Low Stock')
                                                                : getStatusColor('In Stock')
                                                        }`}>
                                                        {getTotalStock(product.sizeStocks) === 0
                                                            ? 'Out of Stock'
                                                            : getTotalStock(product.sizeStocks) <= 10
                                                                ? 'Low Stock'
                                                                : 'In Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {product.isFeatured ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => handleToggleVisibility(product.id)}
                                                        title={product.isVisibleInCollection ? "Hide from collection" : "Show in collection"}
                                                        className="focus:outline-none"
                                                    >
                                                        {product.isVisibleInCollection ? (
                                                            <Eye className="w-5 h-5 text-blue-500 mx-auto" />
                                                        ) : (
                                                            <EyeOff className="w-5 h-5 text-gray-400 mx-auto" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            onClick={() => handleEditProduct(product)}
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="text-red-600 hover:text-red-900"
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="text-blue-600 hover:text-blue-900"
                                                            onClick={() => handleOpenRestockModal(product.id)}
                                                            title="Restock"
                                                        >
                                                            <Warehouse className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'users': {
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-500 mt-1">Manage admin users and permissions</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="space-y-4">
                                {sampleUsers.map((user, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {user.name.split(' ').map((n) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{user.name}</h4>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-900">
                                                  {user.role}
                                                </p>
                                                <p className="text-xs text-gray-500">Role</p>
                                            </div>
                                            <div className="text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-900">{user.lastLogin}</p>
                                                <p className="text-xs text-gray-500">Last Login</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="text-indigo-600 hover:text-indigo-900">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }
            case 'customers':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                            <p className="text-gray-500 mt-1">Manage your customer relationships</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search customers..."
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option>All Customers</option>
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </select>
                                    </div>
                                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Download className="w-4 h-4" />
                                        <span>Export</span>
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {uniqueCustomers.map(customer => (
                                            <tr key={customer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {customer.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                                                            <div className="text-sm text-gray-500">{customer.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{customer.orders}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(customer.lastOrder).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(customer.status)}`}>
                                                        {customer.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-900">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-indigo-600 hover:text-indigo-900">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'inventory':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                            <p className="text-gray-500 mt-1">Track stock levels and manage inventory</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Products</p>
                                        <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                                    </div>
                                    <Package className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Low Stock Items</p>
                                        <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
                                    </div>
                                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Out of Stock</p>
                                        <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
                                    </div>
                                    <X className="w-8 h-8 text-red-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
                            <div className="space-y-4">
                                {[...lowStockProducts, ...outOfStockProducts].map(product => (
                                    <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                                <p className="text-sm text-gray-500">{product.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{getTotalStock(product.sizeStocks)} units</p>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(getTotalStock(product.sizeStocks) > 0 ? 'Low Stock' : 'Out of Stock')}`}>
                                                    {getTotalStock(product.sizeStocks) > 0 ? 'Low Stock' : 'Out of Stock'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleOpenRestockModal(product.id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <span className="font-semibold">Restock</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'analytics':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                            <p className="text-gray-500 mt-1">Track performance and insights</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Revenue"
                                value={`$${totalRevenue}`}
                                change={calculatePseudoChange(parseFloat(totalRevenue))}
                                icon={DollarSign}
                                color="bg-green-500"
                            />
                            <StatCard
                                title="Orders This Month"
                                value={ordersThisMonth}
                                change={calculatePseudoChange(ordersThisMonth)}
                                icon={ShoppingCart}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="New Customers"
                                value={newCustomersThisMonth}
                                change={calculatePseudoChange(newCustomersThisMonth)}
                                icon={Users}
                                color="bg-purple-500"
                            />
                            <StatCard
                                title="Conversion Rate"
                                value="2.4%" // Placeholder
                                change={8.1} // Placeholder
                                icon={TrendingUp}
                                color="bg-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                                <div className="space-y-4">
                                    {productsWithSales.slice(0, 5).map((product, index) => (
                                        <div key={product.id} className="flex items-center space-x-3">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <img src={product.images[0]} alt={product.name} className="w-8 h-8 rounded object-cover" />
                                            <span className="font-semibold text-gray-900">{product.name}</span>
                                            <span className="text-gray-500">{product.sales || 0} units sold</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                                <div className="space-y-4">
                                    {['Floral', 'Fresh', 'Oriental', 'Gourmand', 'Woody'].map((category) => {
                                        const categoryProducts = productsWithSales.filter(p => p.category === category);
                                        const categorySales = categoryProducts.reduce((sum, p) => sum + (p.sales || 0), 0);
                                        const totalSales = productsWithSales.reduce((sum, p) => sum + (p.sales || 0), 0);
                                        const categoryPercentage = totalSales > 0 ? (categorySales / totalSales) * 100 : 0;

                                        return (
                                            <div key={category} className="flex items-center space-x-2">
                                                <span className="font-semibold text-gray-900">{category}</span>
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${categoryPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-500">{categoryPercentage.toFixed(1)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-500 mt-1">Configure your store settings</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                        <input type="text" defaultValue="Luxe Perfumes" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                                        <input type="email" defaultValue="contact@luxeperfumes.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
                                        <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus://ring-blue-500 focus:border-transparent" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Low Stock Alerts</p>
                                            <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Order Notifications</p>
                                            <p className="text-sm text-gray-500">Get notified about new orders</p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Daily Reports</p>
                                            <p className="text-sm text-gray-500">Receive daily sales reports</p>
                                        </div>
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <span className="font-semibold">Save Changes</span>
                            </button>
                        </div>
                    </div>
                );

            case 'orders':
                // Filter orders based on search and status
                const filteredOrders = orders.filter(order => {
                    const matchesSearch =
                        order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        order.email.toLowerCase().includes(orderSearch.toLowerCase());
                    const matchesStatus =
                        orderStatusFilter === 'All' || order.status === orderStatusFilter;
                    return matchesSearch && matchesStatus;
                });

                // Calculate counts for summary cards
                const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
                const processingOrdersCount = orders.filter(o => o.status === 'confirmed' && !o.shipped && !o.delivered).length;
                const shippedOrdersCount = orders.filter(o => o.status === 'confirmed' && o.shipped && !o.delivered).length;
                const deliveredOrdersCount = orders.filter(o => o.status === 'confirmed' && o.shipped && o.delivered).length;
                const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                            <p className="mt-1 text-gray-500">Manage and track customer orders</p>
                        </div>
                        {/* Order status summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 font-medium">Pending</p>
                                    <p className="text-2xl font-bold text-orange-600 mt-1">{pendingOrdersCount}</p>
                                </div>
                                <Clock className="w-8 h-8 text-orange-500" />
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 font-medium">Processing</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">{processingOrdersCount}</p>
                                </div>
                                <Package className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 font-medium">Shipped</p>
                                    <p className="text-2xl font-bold text-purple-600 mt-1">{shippedOrdersCount}</p>
                                </div>
                                <Package2 className="w-8 h-8 text-purple-500" />
                            </div>

                            {/* NEW DELIVERED STAT CARD */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 font-medium">Delivered</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{deliveredOrdersCount}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            {/* END NEW DELIVERED STAT CARD */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 font-medium">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">{cancelledOrdersCount.toLocaleString()}</p>
                                </div>
                                <X className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search orders..."
                                                value={orderSearch}
                                                onChange={e => setOrderSearch(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <select
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={orderStatusFilter}
                                            onChange={e => setOrderStatusFilter(e.target.value as any)}
                                        >
                                            <option value="All">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <div className="w-full overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider max-w-[150px]">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipped</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivered</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredOrders.map((order: Order) => (
                                                <tr key={order.orderNumber} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.orderNumber}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 max-w-[150px] truncate overflow-hidden">{order.customerName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(order.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.itemCount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                                                            order.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : order.status === 'confirmed'
                                                                    ? 'bg-green-100 text-green-600'
                                                                    : order.status === 'cancelled'
                                                                        ? 'bg-red-100 text-red-600'
                                                                        : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        {order.status === 'confirmed' ? (
                                                            <button
                                                                onClick={() => handleToggleShipped(order.orderNumber)}
                                                                className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none transition-colors ${order.shipped ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
                                                            >
                                                                {order.shipped ? 'Shipped' : 'Not Yet'}
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        {order.shipped ? (
                                                            <button
                                                                onClick={() => handleToggleDelivered(order.orderNumber)}
                                                                className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none transition-colors ${order.delivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                                                            >
                                                                {order.delivered ? 'Delivered' : 'Pending'}
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium overflow-visible">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                className="text-blue-600 hover:text-blue-900"
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowOrderDetailsModal(true);
                                                                }}
                                                                title="View Details"
                                                            >
                                                                <InfoIcon className="w-6 h-6" />
                                                            </button>
                                                            <OrderStatusDropdown
                                                                currentStatus={order.status}
                                                                onChange={(status) => handleOrderStatusChange(order.orderNumber, status)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                );
            default:
                return <div>Select a section from the sidebar</div>;
        }
    };

    // This is the CORRECTED handleOrderStatusChange function
    const handleOrderStatusChange = async (orderNumber: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
        const orderToUpdate = orders.find(o => o.orderNumber === orderNumber);
        if (!orderToUpdate || !orderToUpdate._id) return;

        const updatedStatusData = { status: newStatus };

        try {
            const updatedOrderFromBackend = await updateOrderApi(orderToUpdate._id, updatedStatusData);

            setOrders(prevOrders => {
                return prevOrders.map(order => {
                    if (order._id === updatedOrderFromBackend._id) {
                        return {
                            ...updatedOrderFromBackend,
                            shipped: newStatus === 'cancelled' ? false : updatedOrderFromBackend.shipped,
                            delivered: newStatus === 'cancelled' ? false : updatedOrderFromBackend.delivered,
                        };
                    }
                    return order;
                });
            });

            if (updatedOrderFromBackend.status !== orderToUpdate.status) {
                if (newStatus === 'confirmed') {
                    sendEmail('confirmed', updatedOrderFromBackend);
                } else if (newStatus === 'cancelled') {
                    sendEmail('cancelled', updatedOrderFromBackend);
                }
            }
        } catch (error) {
            console.error(`Failed to change order status for ${orderNumber}:`, error);
            alert(`Failed to update order status for ${orderNumber}. Please try again.`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            {isAuthenticated && (
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Luxe Admin</h1>
                        </div>
                    </div>

                    <nav className="flex-1 p-4">
                        <ul className="space-y-2">
                            {navigation.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            setCurrentView(item.id as any);
                                            setShowAddProductModal(false);
                                            setEditingProduct(null);
                                            setNewProduct({
                                                id: '', name: '', category: 'Floral', price: 0, pricePer10Ml: 0, calculatedPrices: {}, sizeStocks: {},
                                                description: '', notes: { top: [], heart: [], base: [] }, reviews: 0, sizes: ['50ml', '100ml'], images: [], isFeatured: false, inStock: true, isVisibleInCollection: true
                                            });
                                            setRawSizesInput('');
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                            currentView === item.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-semibold">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-700">JD</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-8">
                    {isAuthenticated ? renderContent() : (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                            <div className="max-w-md w-full space-y-8">
                                <div>
                                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                                        Admin Login
                                    </h2>
                                </div>
                                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                                    <div className="rounded-md shadow-sm -space-y-px">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Username"
                                                value={credentials.username}
                                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 rounded-t-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                value={credentials.password}
                                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 rounded-b-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <span className="font-semibold">Sign In</span>
                                    </button>
                                </form>
                                <p className="text-center text-sm text-gray-600">
                                    Demo credentials: admin / admin123
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddProductModal && (
                <AddProductModal
                    newProduct={newProduct}
                    setNewProduct={setNewProduct}
                    rawSizesInput={rawSizesInput}
                    setRawSizesInput={setRawSizesInput}
                    handleAddProduct={handleAddProduct}
                    handleUpdateProduct={handleUpdateProduct}
                    handleFormChange={handleFormChange}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    setShowAddProductModal={setShowAddProductModal}
                />
            )}

            {showRestockModal && restockingProductId && (
                <RestockModal
                    product={products.find(p => p.id === restockingProductId) as Product}
                    restockAmount={restockAmount}
                    setRestockAmount={setRestockAmount}
                    handleConfirmRestock={handleConfirmRestock}
                    setShowRestockModal={setShowRestockModal}
                    selectedRestockSize={selectedRestockSize}
                    setSelectedRestockSize={setSelectedRestockSize}
                />
            )}

            {/* Order Details Modal */}
            {showOrderDetailsModal && selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setShowOrderDetailsModal(false)}
                />
            )}
        </div>
    );
}

// Place this helper component above AdminDashboard (or anywhere outside renderContent)
function OrderStatusDropdown({
    currentStatus,
    onChange,
}: {
    currentStatus: 'pending' | 'confirmed' | 'cancelled';
    onChange: (status: 'pending' | 'confirmed' | 'cancelled') => void;
}) {
    const [open, setOpen] = useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            // Check if the click is outside both the button and the dropdown menu
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node) &&
                !(e.target as HTMLElement).closest('.order-status-dropdown-menu') // Added class for menu
            ) {
                setOpen(false);
            }
        };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, [open]);

    // Set menu position when opening
    useEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.right - 160, // 160px is min-width of menu
            });
        }
    }, [open]);

    // Color mapping for status
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-green-100 text-green-600',
        cancelled: 'bg-red-100 text-red-600',
    };

    const statusDotColors = {
        pending: 'bg-yellow-400',
        confirmed: 'bg-green-500',
        cancelled: 'bg-red-500',
    };

    // Hover and selected background color mapping
    const statusHoverBg = {
        pending: 'hover:bg-yellow-100 hover:text-yellow-700',
        confirmed: 'hover:bg-green-100 hover:text-green-700',
        cancelled: 'hover:bg-red-100 hover:text-red-700',
    };

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                title="Edit Status"
                type="button"
                onClick={e => {
                    e.stopPropagation();
                    setOpen(v => !v);
                }}
            >
                <Edit className="w-4 h-4" />
            </button>
            {open && menuPosition && typeof window !== 'undefined' &&
                createPortal(
                    <div
                        className="order-status-dropdown-menu z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[140px] py-1 transition-all duration-150"
                        style={{
                            position: 'absolute',
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
                        <button
                            className={`block w-full text-left px-4 py-2 text-sm ${statusHoverBg.pending} transition-colors ${
                                currentStatus === 'pending'
                                    ? 'font-semibold ' + statusColors.pending
                                    : 'text-gray-700'
                                }`}
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                if (currentStatus !== 'pending') onChange('pending');
                            }}
                        >
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${statusDotColors.pending}`}></span>
                            Pending
                        </button>
                        <button
                            className={`block w-full text-left px-4 py-2 text-sm ${statusHoverBg.confirmed} transition-colors ${
                                currentStatus === 'confirmed'
                                    ? 'font-semibold ' + statusColors.confirmed
                                    : 'text-gray-700'
                                }`}
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                if (currentStatus !== 'confirmed') onChange('confirmed');
                            }}
                        >
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${statusDotColors.confirmed}`}></span>
                            Confirmed
                        </button>
                        <button
                            className={`block w-full text-left px-4 py-2 text-sm ${statusHoverBg.cancelled} transition-colors ${
                                currentStatus === 'cancelled'
                                    ? 'font-semibold ' + statusColors.cancelled
                                    : 'text-gray-700'
                                }`}
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                if (currentStatus !== 'cancelled') onChange('cancelled');
                            }}
                        >
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${statusDotColors.cancelled}`}></span>
                            Cancelled
                        </button>
                    </div>,
                    document.body
                )}
        </div>
    );
}