# @w3st/cms-sdk 設計書

GUIで作成・登録したコンテンツを、フロントエンドから型安全に利用するためのTypeScript SDK。

## 技術スタック
- TypeScript, Axios, Jest, Rollup

## 基本的な使い方
**ステップ1：型定義の生成 (CLI)**
```bash
export W3ST_BASE_URL='https://api.your-project.w3st.io'
export W3ST_TOKEN='your-jwt-token'
npx @w3st/cli pull
```
これにより、`src/w3st-types.ts` と `src/types.ts` の `COLLECTION_IDS` が更新。

**ステップ2：クライアントの初期化**
```typescript
import { createClient } from '@w3st/cms-sdk';

export const cms = createClient({
  baseURL: 'https://api.your-project.w3st.io',
  apiKey: 'your-public-api-key'
});
```

**ステップ3：コンテンツの取得**
```typescript
import { cms } from './lib/client';
import type { Article } from './w3st-types';

async function getArticles() {
  const articles = await cms.content('articles').findMany();
  return articles;
}
```

## ユースケース例
**ブログ記事一覧 (Next.js)**
```typescript
import type { Article } from './w3st-types';

export default async function BlogPage() {
  const articles = await cms.content('articles').findMany({
    populate: ['eyecatch']
  });
  return (
    <ul>
      {articles.map((article) => (
        <li key={article.id}>
          <h2>{article.title}</h2>
          <img src={article.eyecatch.url} alt={article.eyecatch.alt} />
        </li>
      ))}
    </ul>
  );
}
```

## ポイント
- `cms.content<T>('api-name')` で型安全アクセス。
- `populate` でリレーション解決。
- GUI投稿で即時反映。