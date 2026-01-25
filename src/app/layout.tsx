import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI电商营销平台 | 绘蛙',
    template: '%s | AI电商营销平台',
  },
  description:
    '功能完整的AI电商营销平台，集成AI文案生成、AI模特训练、AI商品图生成、图生视频、AI图片处理、模特换脸与背景更换、AI电商详情图设计等多种AI能力，为商家提供智能化的营销创作工具。支持小红书、淘宝、天猫、京东、速卖通等多种电商平台。',
  keywords: [
    'AI电商营销',
    'AI文案生成',
    'AI模特训练',
    'AI商品图生成',
    '图生视频',
    'AI图片处理',
    '模特换脸',
    '电商详情图设计',
    '小红书种草',
    '淘宝商品图',
    '电商营销工具',
    'AI创作平台',
  ],
  authors: [{ name: 'AI电商营销平台 Team' }],
  generator: 'AI电商营销平台',
  // icons: {
  //   icon: '',
  // },
  openGraph: {
    title: 'AI电商营销平台 | 助力商家轻松创作',
    description:
      '功能完整的AI电商营销平台，集成AI文案生成、AI模特训练、AI商品图生成、图生视频、AI图片处理等多种AI能力，为商家提供智能化的营销创作工具。',
    url: 'https://example.com',
    siteName: 'AI电商营销平台',
    locale: 'zh_CN',
    type: 'website',
    // images: [
    //   {
    //     url: '',
    //     width: 1200,
    //     height: 630,
    //     alt: '扣子编程 - 你的 AI 工程师',
    //   },
    // ],
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Coze Code | Your AI Engineer is Here',
  //   description:
  //     'Build and deploy full-stack applications through AI conversation. No env setup, just flow.',
  //   // images: [''],
  // },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
