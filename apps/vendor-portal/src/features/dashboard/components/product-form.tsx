'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

export interface ProductVariant {
  name: string;
  price?: number;
  stock?: number;
  sku?: string;
  active: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductFormData {
  id?: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  stock: number;
  description: string;
  images: string[];
  options: ProductOption[];
  variants: ProductVariant[];
}

// Predefined mock images for preset selection
const IMAGE_PRESETS = [
  { name: 'SoundBlast Speaker', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&h=300&q=80' },
  { name: 'GaN Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&h=300&q=80' },
  { name: 'Mechanical Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&h=300&q=80' },
  { name: 'Gaming Mouse', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&h=300&q=80' },
  { name: 'Desk Smart Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&h=300&q=80' },
  { name: 'Wireless Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=300&q=80' },
];

const MOCK_CLOUD_IMAGES = [
  { name: 'white_bg_cover.jpg', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&h=300&q=80', size: '1.2 MB' },
  { name: 'lifestyle_detail_01.jpg', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&h=300&q=80', size: '2.4 MB' },
  { name: 'packaging_box_flat.jpg', url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=400&h=300&q=80', size: '980 KB' },
  { name: 'spec_sheet_infographic.png', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&h=300&q=80', size: '3.1 MB' },
  { name: 'studio_dark_setup.jpg', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&h=300&q=80', size: '1.7 MB' },
  { name: 'outdoor_running_use.png', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&h=300&q=80', size: '2.8 MB' }
];

const CATEGORIES = [
  'Smart gadgets',
  'Apparels & Clothing',
  'Mother & Baby care',
  'Electronics',
  'Kitchen Essentials',
  'Bath Essentials',
  'Home Arrivals',
  'Beauty and Cosmetics',
  'Health & Fitness',
  'Tools',
];

interface ProductFormProps {
  initialData?: ProductFormData;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSave, onCancel }: ProductFormProps) {
  const isEditMode = !!initialData;

  // Form states
  const [name, setName] = React.useState(initialData?.name || '');
  const [sku, setSku] = React.useState(initialData?.sku || '');
  const [category, setCategory] = React.useState(initialData?.category || CATEGORIES[0] || 'Smart gadgets');
  const [regularPrice, setRegularPrice] = React.useState<number | ''>(
    initialData ? (initialData.oldPrice ? initialData.oldPrice : initialData.price) : ''
  );
  const [discountedPrice, setDiscountedPrice] = React.useState<number | ''>(
    initialData ? (initialData.oldPrice ? initialData.price : '') : ''
  );
  const [stock, setStock] = React.useState<number>(initialData?.stock || 0);
  const [description, setDescription] = React.useState(initialData?.description || '');
  
  // Images
  const [images, setImages] = React.useState<string[]>(initialData?.images || []);
  const [customImageUrl, setCustomImageUrl] = React.useState('');
  
  // Advanced image upload states
  const [uploadTab, setUploadTab] = React.useState<'SYSTEM' | 'CLOUD' | 'OTHER'>('SYSTEM');
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [showCloudDrive, setShowCloudDrive] = React.useState(false);
  const [cloudProvider, setCloudProvider] = React.useState('');
  const [selectedCloudImages, setSelectedCloudImages] = React.useState<string[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);

  // Computed prices
  const finalPrice = (discountedPrice !== '' && Number(discountedPrice) > 0)
    ? Number(discountedPrice)
    : (regularPrice !== '' ? Number(regularPrice) : 0);

  const finalOldPrice = (discountedPrice !== '' && Number(discountedPrice) > 0)
    ? (regularPrice !== '' ? Number(regularPrice) : undefined)
    : undefined;

  const hasDiscount = !!(finalOldPrice && finalOldPrice > finalPrice);
  const calculatedDiscount = hasDiscount
    ? Math.round(((finalOldPrice - finalPrice) / finalOldPrice) * 100)
    : 0;

  const handleFileSelection = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === 'string') {
            const resultUrl = event.target.result;
            setImages((prev) => {
              if (prev.includes(resultUrl)) return prev;
              return [...prev, resultUrl];
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleOpenCloudDrive = (provider: string) => {
    setCloudProvider(provider);
    setSelectedCloudImages([]);
    setShowCloudDrive(true);
  };

  const handleToggleCloudSelection = (url: string) => {
    setSelectedCloudImages((prev) => {
      if (prev.includes(url)) {
        return prev.filter((u) => u !== url);
      }
      return [...prev, url];
    });
  };

  const handleImportCloudImages = () => {
    setImages((prev) => {
      const next = [...prev];
      selectedCloudImages.forEach((url) => {
        if (!next.includes(url)) {
          next.push(url);
        }
      });
      return next;
    });
    setShowCloudDrive(false);
    setSelectedCloudImages([]);
  };

  // Options & Variants
  const [options, setOptions] = React.useState<ProductOption[]>(initialData?.options || []);
  const [newOptionName, setNewOptionName] = React.useState('');
  const [newOptionValue, setNewOptionValue] = React.useState<{ [key: string]: string }>({});
  const [variants, setVariants] = React.useState<ProductVariant[]>(initialData?.variants || []);

  // Autofill SKU based on product name
  React.useEffect(() => {
    if (!isEditMode && name && !sku) {
      const formatted = 'VLX-' + name.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 8);
      setSku(formatted);
    }
  }, [name, isEditMode, sku]);

  // Helper to handle custom image input
  const handleAddCustomImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrl && customImageUrl.trim().startsWith('http')) {
      setImages((prev) => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  // Helper to select preset image
  const handleSelectPreset = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const handleMakeCover = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      if (item) next.unshift(item);
      return next;
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Options actions
  const handleAddOption = () => {
    if (newOptionName.trim()) {
      const newOption: ProductOption = {
        id: Date.now().toString(),
        name: newOptionName.trim(),
        values: [],
      };
      setOptions((prev) => [...prev, newOption]);
      setNewOptionName('');
    }
  };

  const handleRemoveOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleAddOptionValue = (optionId: string) => {
    const value = newOptionValue[optionId]?.trim();
    if (value) {
      setOptions((prev) =>
        prev.map((o) => {
          if (o.id === optionId) {
            if (o.values.includes(value)) return o;
            return { ...o, values: [...o.values, value] };
          }
          return o;
        })
      );
      setNewOptionValue((prev) => ({ ...prev, [optionId]: '' }));
    }
  };

  const handleRemoveOptionValue = (optionId: string, value: string) => {
    setOptions((prev) =>
      prev.map((o) => {
        if (o.id === optionId) {
          return { ...o, values: o.values.filter((v) => v !== value) };
        }
        return o;
      })
    );
  };

  // Cartesian Product variant generator
  const handleGenerateVariants = () => {
    const validOptions = options.filter((o) => o.values.length > 0);
    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }

    // Cartesian product helper
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (a, b) => a.flatMap((d) => b.map((e) => [...d, e])),
        [[]]
      );
    };

    const optionValues = validOptions.map((o) => o.values);
    const combinations = cartesian(optionValues);

    const newVariants: ProductVariant[] = combinations.map((combo) => {
      const variantName = combo.join(' / ');
      // Preserve existing configuration if option values match
      const existing = variants.find((v) => v.name === variantName);
      if (existing) return existing;

      // Auto SKU formatting
      const skuSuffix = combo
        .map((c) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))
        .join('-');

      return {
        name: variantName,
        price: finalPrice,
        stock: 10,
        sku: `${sku}-${skuSuffix}`,
        active: true,
      };
    });

    setVariants(newVariants);
  };

  const handleUpdateVariant = (index: number, key: keyof ProductVariant, value: string | number | boolean) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v))
    );
  };

  // Form submit handler
  const processSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a Product Name before publishing.');
      return;
    }

    const calculatedPrice = finalPrice || (regularPrice !== '' ? Number(regularPrice) : 0);
    if (!calculatedPrice || calculatedPrice <= 0) {
      alert('Please enter a valid Price (PKR) for your product.');
      return;
    }

    const finalStock = variants.length > 0
      ? variants.filter(v => v.active).reduce((sum, v) => sum + (v.stock || 0), 0)
      : stock;

    const generatedSku = sku || ('VLX-' + name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 8));

    onSave({
      id: initialData?.id,
      sku: generatedSku,
      name: name.trim(),
      category,
      price: calculatedPrice,
      oldPrice: finalOldPrice,
      discount: hasDiscount ? calculatedDiscount : undefined,
      stock: finalStock || 0,
      description: description.trim(),
      images,
      options,
      variants: variants.filter(v => v.active),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processSubmit();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Left Form controls (3 cols) */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-wider uppercase text-foreground">
              {isEditMode ? 'Edit Product Details' : 'Create New Product'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter general information, custom options, images, and variants.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-[10px] font-black uppercase tracking-wider h-9 px-4 rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                processSubmit();
              }}
              disabled={!name.trim()}
              className="text-[10px] font-black uppercase tracking-wider h-9 px-5 rounded-xl"
            >
              {isEditMode ? 'Save Product' : 'Publish Product'}
            </Button>
          </div>
        </div>

        {/* 1. General settings card */}
        <Card className="bg-card/50 border-border backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">
              1. General Details
            </CardTitle>
            <CardDescription className="text-[11px]">
              Set name, category, pricing, and base SKU.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Product Name
              </label>
              <Input
                placeholder="e.g., High-Fidelity Bluetooth Speaker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-xs font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-background text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Base SKU Reference
                </label>
                <Input
                  placeholder="e.g., VLX-EP-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Price (PKR)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1000"
                  value={regularPrice || ''}
                  onChange={(e) => setRegularPrice(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Discounted Price (PKR)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 800"
                  value={discountedPrice || ''}
                  onChange={(e) => setDiscountedPrice(e.target.value ? Number(e.target.value) : '')}
                  className="text-xs font-bold text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Base Stock (Quantity)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={stock || ''}
                  onChange={(e) => setStock(Number(e.target.value))}
                  disabled={variants.length > 0}
                  className="text-xs font-bold"
                />
              </div>
            </div>
            {variants.length > 0 && (
              <span className="text-[9px] font-semibold text-amber-500 block -mt-2">
                Stock is derived from the sum of active variants below.
              </span>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                placeholder="Describe your product's key features, specifications, and warranty details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-xs font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Image presets & gallery card */}
        <Card className="bg-card/50 border-border backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">
              2. Images & Media
            </CardTitle>
            <CardDescription className="text-[11px]">
              Add files from your system, online drive or presets. First image represents the cover.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            {/* Upload Source Tab Selector */}
            <div className="flex space-x-1 p-1 rounded-xl bg-secondary/35 border border-border max-w-md">
              <button
                type="button"
                onClick={() => setUploadTab('SYSTEM')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  uploadTab === 'SYSTEM'
                    ? 'bg-card text-foreground shadow-sm border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                💻 System
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('CLOUD')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  uploadTab === 'CLOUD'
                    ? 'bg-card text-foreground shadow-sm border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ☁️ Cloud Drive
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('OTHER')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  uploadTab === 'OTHER'
                    ? 'bg-card text-foreground shadow-sm border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🔗 presets & URL
              </button>
            </div>

            {/* Tab 1: Local System Upload */}
            {uploadTab === 'SYSTEM' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files);
                  handleFileSelection(files);
                }}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-secondary/10 hover:bg-secondary/20 hover:border-primary/40'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileSelection(Array.from(e.target.files));
                    }
                  }}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-foreground">Drag & drop images here, or click to browse</p>
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-1.5">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}

            {/* Tab 2: Simulated Cloud Drive */}
            {uploadTab === 'CLOUD' && (
              <div className="border border-border bg-secondary/15 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleOpenCloudDrive('Google Drive')}
                    className="flex items-center space-x-2 bg-card border border-border px-4 py-2.5 rounded-xl hover:bg-secondary/40 text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
                  >
                    <span className="text-base">🤖</span>
                    <span>Google Drive</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCloudDrive('OneDrive')}
                    className="flex items-center space-x-2 bg-card border border-border px-4 py-2.5 rounded-xl hover:bg-secondary/40 text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
                  >
                    <span className="text-base">☁️</span>
                    <span>OneDrive</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCloudDrive('Dropbox')}
                    className="flex items-center space-x-2 bg-card border border-border px-4 py-2.5 rounded-xl hover:bg-secondary/40 text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
                  >
                    <span className="text-base">📦</span>
                    <span>Dropbox</span>
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Connect cloud storage to import high resolution catalog files directly.
                </p>
              </div>
            )}

            {/* Tab 3: Presets & Link Custom URL */}
            {uploadTab === 'OTHER' && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                    Quick Preset Selection
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {IMAGE_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url)}
                        className="group border border-border bg-secondary/20 hover:border-primary rounded-lg p-1 overflow-hidden transition-all duration-150 focus:outline-none relative"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-10 object-cover rounded-md group-hover:scale-110 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider transition-opacity">
                          + Add
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                    Link Custom Image URL
                  </span>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="https://example.com/product-image.jpg"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="text-xs font-semibold flex-grow"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomImage}
                      variant="secondary"
                      className="text-[10px] font-black uppercase tracking-wider h-10 px-4 rounded-xl border border-border"
                    >
                      Link URL
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Current gallery grid with Checkerboard container style for Auto-adjusting sizes */}
            {images.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Product Gallery
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="group border border-border bg-secondary/10 hover:border-primary/40 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center cursor-pointer select-none"
                      onClick={() => setPreviewImageUrl(url)}
                    >
                      {/* Checkered-like grid overlay for transparent/contained spaces */}
                      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <img src={url} alt={`Gallery ${index}`} className="max-w-full max-h-full object-contain p-1 transition-transform group-hover:scale-105 duration-200" />
                      
                      {/* Controls overlay */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2 transition-opacity duration-150"
                      >
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(index)}
                            className="p-1.5 bg-destructive/90 text-white rounded-lg hover:bg-destructive transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        {index === 0 ? (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-md self-start">
                            Cover Image
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeCover(index)}
                            className="text-[8px] font-black uppercase tracking-wider bg-primary/90 text-white px-2 py-0.5 rounded-md self-start hover:bg-primary transition-colors"
                          >
                            Make Cover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Custom options and variants matrix */}
        <Card className="bg-card/50 border-border backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">
              3. Variants & Options
            </CardTitle>
            <CardDescription className="text-[11px]">
              Add custom options (e.g. Size, Color) and auto-generate the inventory variant matrix.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-6">
            {/* Options configuration */}
            <div className="space-y-4">
              <div className="flex items-end space-x-2">
                <div className="flex-grow space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Add Option Class
                  </label>
                  <Input
                    placeholder="e.g., Color or Size"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    className="text-xs font-semibold h-10"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddOption}
                  variant="outline"
                  className="text-[10px] font-black uppercase tracking-wider h-10 px-4 rounded-xl border-border"
                >
                  + Add Class
                </Button>
              </div>

              {/* Options display list */}
              {options.length > 0 && (
                <div className="space-y-3 pt-2">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="border border-border bg-secondary/10 p-4 rounded-xl space-y-3 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground">
                          Option: {opt.name}
                        </span>
                      </div>

                      {/* Values sub-form */}
                      <div className="flex flex-wrap gap-1.5">
                        {opt.values.map((v) => (
                          <span
                            key={v}
                            className="inline-flex items-center space-x-1 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full"
                          >
                            <span>{v}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionValue(opt.id, v)}
                              className="w-3 h-3 hover:text-destructive font-black"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="e.g. Red (Press Add Value)"
                          value={newOptionValue[opt.id] || ''}
                          onChange={(e) =>
                            setNewOptionValue((prev) => ({ ...prev, [opt.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOptionValue(opt.id);
                            }
                          }}
                          className="h-8 text-xs font-medium max-w-xs"
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddOptionValue(opt.id)}
                          variant="secondary"
                          className="text-[9px] font-black uppercase tracking-wider h-8 px-3 rounded-lg border border-border"
                        >
                          Add Value
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={handleGenerateVariants}
                      variant="primary"
                      className="text-[10px] font-black uppercase tracking-wider h-9 px-4 rounded-xl"
                    >
                      Generate Variant Override Matrix
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Variants Override Matrix Table */}
            {variants.length > 0 && (
              <div className="border border-border/80 bg-secondary/5 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border/60 text-[9px] font-black uppercase tracking-wider text-muted-foreground bg-secondary/20">
                      <th className="py-2.5 px-4">Active</th>
                      <th className="py-2.5 px-4">Variant Option</th>
                      <th className="py-2.5 px-4">SKU Override</th>
                      <th className="py-2.5 px-4 text-right">Price (PKR)</th>
                      <th className="py-2.5 px-4 text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {variants.map((v, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-secondary/10 transition-colors ${
                          !v.active && 'opacity-50'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={v.active}
                            onChange={(e) => handleUpdateVariant(index, 'active', e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                          />
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground">
                          {v.name}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={v.sku || ''}
                            onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value)}
                            className="h-8 max-w-[120px] bg-secondary/35 border border-border rounded px-2 text-[10px] font-mono font-bold"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            value={v.price || ''}
                            onChange={(e) => handleUpdateVariant(index, 'price', Number(e.target.value))}
                            className="h-8 max-w-[90px] bg-secondary/35 border border-border rounded px-2 text-[10px] text-right font-black"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            value={v.stock || ''}
                            onChange={(e) => handleUpdateVariant(index, 'stock', Number(e.target.value))}
                            className="h-8 max-w-[60px] bg-secondary/35 border border-border rounded px-2 text-[10px] text-center font-bold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Right Live Preview Card (2 cols) */}
      <div className="lg:col-span-2 space-y-4 sticky top-24">
        <div className="select-none">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
            Real-Time Marketplace Preview
          </h3>
          <p className="text-[10px] text-muted-foreground leading-normal">
            This card represents how your product appears to customers in the marketplace search results page.
          </p>
        </div>

        <div className="border border-border/80 bg-card rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 relative group max-w-sm mx-auto">
          {/* Discount Badge */}
          {hasDiscount ? (
            <span className="absolute top-3 left-3 bg-destructive text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full z-10 shadow-md">
              {calculatedDiscount}% OFF
            </span>
          ) : (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full z-10 shadow-md">
              New Listing
            </span>
          )}

          {/* Product Image - Contain and adjust size dynamically */}
          <div className="aspect-video bg-secondary/20 relative overflow-hidden flex items-center justify-center border-b border-border">
            {/* Checkerboard pattern for contained/empty space alignment */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt="Product Preview"
                className="max-w-full max-h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/60 space-y-1">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-wider">No images uploaded</span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3.5 bg-card/40 backdrop-blur-md">
            {/* Category */}
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">
              {category}
            </span>

            {/* Title */}
            <h4 className="text-sm font-bold text-foreground truncate leading-none">
              {name || 'Product Title Placeholder'}
            </h4>

            {/* Rating */}
            <div className="flex items-center space-x-1 text-amber-500">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[10px] text-muted-foreground font-black">4.8 (12 reviews)</span>
            </div>

            {/* Price & Escrow */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs text-muted-foreground block text-[9px] font-bold uppercase tracking-wider">Price</span>
                <div className="flex flex-col">
                  <span className="text-base font-black text-foreground">
                    PKR {finalPrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-muted-foreground line-through font-semibold">
                      PKR {Number(regularPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[8px] font-black uppercase tracking-wider">Escrow Protected</span>
              </div>
            </div>

            {/* Shipping details */}
            <div className="border-t border-border/40 pt-3 flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
              <span className="flex items-center space-x-1">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Stock: {variants.length > 0 ? variants.filter(v => v.active).reduce((sum, v) => sum + (v.stock || 0), 0) : stock} units</span>
              </span>
              <span>SKU: {sku || 'VLX-TBD'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Cloud Drive Picker Dialog */}
    {showCloudDrive && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <Card className="w-full max-w-2xl bg-card border-border shadow-2xl animate-scale-in">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-black uppercase tracking-wider text-foreground">
                Select Images from {cloudProvider}
              </CardTitle>
              <button
                type="button"
                onClick={() => setShowCloudDrive(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CardDescription className="text-xs">
              Select simulated high-resolution files from your cloud storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-1">
              {MOCK_CLOUD_IMAGES.map((img) => (
                <div
                  key={img.url}
                  onClick={() => handleToggleCloudSelection(img.url)}
                  className={`relative group border rounded-xl overflow-hidden cursor-pointer aspect-video flex items-center justify-center select-none transition-all duration-150 ${
                    selectedCloudImages.includes(img.url)
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border bg-secondary/15 hover:border-primary/40'
                  }`}
                >
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"></div>
                  <img src={img.url} alt={img.name} className="max-w-full max-h-full object-contain p-1" />
                  
                  {/* File info overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1.5 flex items-center justify-between text-[9px] text-white">
                    <span className="truncate font-bold max-w-[100px]">{img.name}</span>
                    <span className="font-semibold opacity-80 shrink-0">{img.size}</span>
                  </div>

                  {/* Select indicator */}
                  <div className="absolute top-2 left-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      selectedCloudImages.includes(img.url)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-black/40 border-white/60 text-transparent'
                    }`}>
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="flex items-center justify-end space-x-2 p-6 pt-0 border-t border-border/40 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCloudDrive(false)}
              className="text-[10px] font-black uppercase tracking-wider h-9 px-4 rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleImportCloudImages}
              disabled={selectedCloudImages.length === 0}
              className="text-[10px] font-black uppercase tracking-wider h-9 px-5 rounded-xl"
            >
              Import {selectedCloudImages.length} Image{selectedCloudImages.length > 1 ? 's' : ''}
            </Button>
          </div>
        </Card>
      </div>
    )}

    {/* Fullscreen Image Preview Modal */}
    {previewImageUrl && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
        onClick={() => setPreviewImageUrl(null)}
      >
        <div className="relative max-w-[95vw] max-h-[85vh] flex items-center justify-center">
          <button
            onClick={() => setPreviewImageUrl(null)}
            className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors flex items-center space-x-1 bg-black/45 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close</span>
          </button>
          <img
            src={previewImageUrl}
            alt="Fullscreen Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10 animate-scale-in"
          />
        </div>
      </div>
    )}
  </>
);
}
