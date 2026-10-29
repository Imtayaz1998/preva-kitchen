'use client';

import { useEffect, useState } from 'react';

export default function MenuProductBreadcrumbName({ productName }) {
  const [name, setName] = useState(productName);

  useEffect(() => {
    const updateName = (event) => {
      if (event.detail?.productName) setName(event.detail.productName);
    };

    window.addEventListener('preva:menu-product-name-change', updateName);
    return () => window.removeEventListener('preva:menu-product-name-change', updateName);
  }, []);

  return <span>{name}</span>;
}
