'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Zap, Gift } from 'lucide-react';
import { PricingCards, plans } from '@/components/membership/pricing-cards';
import { PurchaseForm } from '@/components/membership/purchase-form';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[2]; // 默认专业版

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleBack = () => {
    setSelectedPlanId(null);
  };

  const handlePurchaseSuccess = (orderId: string) => {
    console.log('Order created:', orderId);
    // 可以跳转到成功页面或会员中心
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">智</span>
              </div>
              <div>
                <h1 className="font-semibold">智创云电商设计</h1>
                <p className="text-xs text-muted-foreground">AI驱动的电商内容创作平台</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">帮助中心</Button>
              <Button variant="outline" size="sm">登录</Button>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600">免费试用</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {!selectedPlanId ? (
          <>
            {/* Hero区域 */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4 bg-orange-50 text-orange-600 border-orange-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI赋能电商创作
              </Badge>
              <h1 className="text-4xl font-bold mb-4">
                选择适合您的会员方案
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                强大的AI工具，助您轻松完成商品图、文案、视频等电商内容创作
              </p>

              {/* 年付/月付切换 */}
              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm ${!isYearly ? 'font-medium' : 'text-muted-foreground'}`}>
                  月付
                </span>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={isYearly} 
                    onCheckedChange={setIsYearly}
                  />
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                    <Gift className="h-3 w-3 mr-1" />
                    年付7折
                  </Badge>
                </div>
                <span className={`text-sm ${isYearly ? 'font-medium' : 'text-muted-foreground'}`}>
                  年付
                </span>
              </div>
            </div>

            {/* 定价卡片 */}
            <PricingCards 
              onSelectPlan={handleSelectPlan} 
              isYearly={isYearly}
            />

            {/* FAQ */}
            <div className="max-w-2xl mx-auto mt-16">
              <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
              <div className="space-y-4">
                {[
                  {
                    q: 'AI额度是怎么计算的？',
                    a: '每次使用AI功能（如生成文案、图片等）消耗1次额度。不同会员等级每日可使用的额度不同。'
                  },
                  {
                    q: '年付可以退款吗？',
                    a: '年付会员在购买后7天内，如使用额度未超过50次，可申请全额退款。'
                  },
                  {
                    q: '如何升级或降级套餐？',
                    a: '您可以随时在会员中心升级套餐。降级将在当前周期结束后生效。'
                  },
                  {
                    q: '企业版有什么特殊权益？',
                    a: '企业版支持多账号协作、批量处理、API接口、专属客服等高级功能。'
                  },
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{item.q}</h3>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部CTA */}
            <div className="text-center mt-16 p-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl text-white">
              <h2 className="text-2xl font-bold mb-2">还在犹豫？</h2>
              <p className="mb-4 opacity-90">先试试免费体验版，感受AI创作的强大</p>
              <Button variant="secondary" size="lg" className="bg-white text-orange-600 hover:bg-white/90">
                立即免费体验
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* 购买流程 */}
            <PurchaseForm
              selectedPlan={{
                id: selectedPlan.id,
                name: selectedPlan.name,
                price: selectedPlan.price,
                yearlyPrice: selectedPlan.yearlyPrice,
                dailyQuota: selectedPlan.id === 'trial' ? 10 : 
                            selectedPlan.id === 'personal' ? 50 :
                            selectedPlan.id === 'professional' ? 200 : 500,
              }}
              isYearly={isYearly}
              onBack={handleBack}
              onSuccess={handlePurchaseSuccess}
            />
          </>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                智创云电商设计 © 2024
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                让电商内容创作更简单
              </p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">服务条款</a>
              <a href="#" className="hover:text-foreground">隐私政策</a>
              <a href="#" className="hover:text-foreground">联系我们</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
