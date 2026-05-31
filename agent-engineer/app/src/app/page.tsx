import Image from 'next/image';
import { getAllProducts } from '@/lib/products';

export default function CatalogPage() {
  const products = getAllProducts();

  return (
    <>
      <h1>TVs ({products.length})</h1>
      <div className="catalog-grid">
        {products.map(p => (
          <a key={p.id} href={`/product/${p.id}`} className="product-card">
            <div className="card-image">
              <Image
                src={p.imageUrl}
                alt={p.name}
                width={600}
                height={400}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                unoptimized
              />
            </div>
            <span className="brand">{p.brand}</span>
            <span className="product-name">{p.name}</span>
            <span className="price">${p.price.toLocaleString()}</span>
            <span className="meta">{p.size}" · {p.displayType} · {p.refreshRate}Hz</span>
            <span className="rating">★ {p.rating} ({p.reviewCount.toLocaleString()} reviews)</span>
          </a>
        ))}
      </div>
    </>
  );
}
