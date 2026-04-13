'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Zap, Crown, Building2 } from 'lucide-react';

const plans = [
  {
    id: 'trial',
    name: '体验版',
    price: 0,
    yearlyPrice: 0,
    description: '免费试用，了解平台功能',
    features: [
      '每日10次AI额度',
      '文案生成',
      '商品图生成（低分辨率）',
      '图片处理基础功能',
      '有水印导出',
    ],
    limitations: [
      '无法使用换装功能',
      '无法下载高清图片',
      '视频生成限4秒',
    ],
    buttonText: '立即体验',
    buttonVariant: 'outline' as const,
    icon: Sparkles,
    popular: false,
  },
  {
    id: 'personal',
    name: '个人版',
    price: 39,
    yearlyPrice: 328,
    description: '适合个人卖家和兼职店主',
    features: [
      '每日50次AI额度',
      '全部AI功能',
      '商品图生成（高清）',
      '详情图设计',
      '无水印导出',
      '基础客服支持',
    ],
    limitations: [],
    buttonText: '开通个人版',
    buttonVariant: 'outline' as const,
    icon: Zap,
    popular: false,
  },
  {
    id: 'professional',
    name: '专业版',
    price: 99,
    yearlyPrice: 830,
    description: '适合专业卖家和工作室',
    features: [
      '每日200次AI额度',
      '全部AI功能',
      '模特换脸/换装/换背景',
      '图生视频',
      '优先处理队列',
      '专属客服支持',
      'API接口（即将上线）',
    ],
    limitations: [],
    buttonText: '开通专业版',
    buttonVariant: 'default' as const,
    icon: Crown,
    popular: true,
  },
  {
    id: 'business',
    name: '商家版',
    price: 199,
    yearlyPrice: 1670,
    description: '适合电商团队和企业',
    features: [
      '每日500次AI额度',
      '全部AI功能+企业专属',
      '多账号协作',
      '批量处理',
      '数据统计分析',
      '7x24小时专属客服',
      '优先新功能体验',
    ],
    limitations: [],
    buttonText: '开通商家版',
    buttonVariant: 'outline' as const,
    icon: Building2,
    popular: false,
  },
];

interface PricingCardsProps {
  onSelectPlan?: (planId: string) => void;
  showYearlyToggle?: boolean;
  isYearly?: boolean;
}

export function PricingCards({ onSelectPlan, showYearlyToggle = true, isYearly = false }: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {plans.map((plan) => {
        const Icon = plan.icon;
        const displayPrice = isYearly ? plan.yearlyPrice : plan.price;
        const priceLabel = isYearly ? '/年' : '/月';
        const perMonthPrice = isYearly && plan.price > 0 ? Math.round(plan.yearlyPrice / 12) : plan.price;

        return (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.popular 
                ? 'border-2 border-gradient-to-r from-orange-500 to-red-600 shadow-lg' 
                : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1">
                  推荐
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center ${
                plan.popular 
                  ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                  : 'bg-muted'
              }`}>
                <Icon className={`h-6 w-6 ${plan.popular ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
              
              <div className="pt-2">
                <span className="text-3xl font-bold">
                  {displayPrice === 0 ? '免费' : `¥${displayPrice}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground text-sm">{priceLabel}</span>
                )}
                {isYearly && plan.price > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    折合 ¥{perMonthPrice}/月
                  </p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {plan.limitations.length > 0 && (
                <div className="pt-2 border-t space-y-1">
                  {plan.limitations.map((limitation, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      • {limitation}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                variant={plan.buttonVariant}
                className={`w-full ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                    : ''
                }`}
                onClick={() => onSelectPlan?.(plan.id)}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export { plans };
