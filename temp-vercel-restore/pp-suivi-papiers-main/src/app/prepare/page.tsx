import { Suspense } from 'react';
import PreparePageClient from './PreparePageClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PreparePageClient />
    </Suspense>
  );
}