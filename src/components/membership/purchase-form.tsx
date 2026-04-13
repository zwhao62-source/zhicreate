'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, CreditCard, Smartphone, Loader2, Shield, Gift, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  dailyQuota?: number;
}

interface PurchaseFormProps {
  selectedPlan: PlanInfo;
  isYearly?: boolean;
  onBack?: () => void;
  onSuccess?: (orderId: string) => void;
}

export function PurchaseForm({ selectedPlan, isYearly = false, onBack, onSuccess }: PurchaseFormProps) {
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'card'>('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  const displayPrice = isYearly && selectedPlan.yearlyPrice 
    ? selectedPlan.yearlyPrice 
    : selectedPlan.price;
  
  const discount = couponDiscount > 0 ? Math.round(displayPrice * couponDiscount / 100) : 0;
  const finalPrice = displayPrice - discount;
  
  const handleApplyCoupon = () => {
    // 模拟优惠券验证
    if (couponCode.toUpperCase() === 'NEWUSER') {
      setCouponDiscount(20);
      setCouponError('');
    } else if (couponCode.toUpperCase() === 'ZHICHUANG') {
      setCouponDiscount(10);
      setCouponError('');
    } else {
      setCouponDiscount(0);
      setCouponError('优惠券码无效');
    }
  };

  const handlePay = async () => {
    setIsProcessing(true);
    
    // 模拟支付
    setTimeout(() => {
      setIsProcessing(false);
      const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      onSuccess?.(orderId);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        )}
        <div>
          <h1 className="text-xl font-semibold">开通 {selectedPlan.name}</h1>
          <p className="text-sm text-muted-foreground">
            {isYearly ? '年付方案' : '月付方案'}
          </p>
        </div>
      </div>

      {step === 'select' && (
        <div className="space-y-6">
          {/* 订单摘要 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">订单摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{selectedPlan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlan.dailyQuota && `每日${selectedPlan.dailyQuota}次AI额度`}
                  </p>
                </div>
                <p className="text-xl font-bold">¥{displayPrice}</p>
              </div>
              
              {isYearly && selectedPlan.yearlyPrice && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    年付优惠
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    省 ¥{(selectedPlan.price * 12 - selectedPlan.yearlyPrice)} / 年
                  </span>
                </div>
              )}

              <Separator />

              {/* 优惠券 */}
              <div className="space-y-2">
                <Label>使用优惠券</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="输入优惠码"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    兑换
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500">{couponError}</p>
                )}
                {!couponError && couponDiscount > 0 && (
                  <p className="text-xs text-green-600">
                    <Check className="h-3 w-3 inline mr-1" />
                    已抵扣 {couponDiscount}%
                  </p>
                )}
              </div>

              <Separator />

              {/* 金额明细 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品金额</span>
                  <span>¥{displayPrice}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>优惠券抵扣</span>
                    <span>-¥{discount}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>应付金额</span>
                  <span className="text-red-600">¥{finalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 支付方式 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">选择支付方式</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(v) => setPaymentMethod(v as any)}
                className="space-y-3"
              >
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="alipay" />
                    <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">支</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">支付宝</p>
                      <p className="text-xs text-muted-foreground">推荐</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="wechat" />
                    <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">微</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">微信支付</p>
                      <p className="text-xs text-muted-foreground">实时到账</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="card" />
                    <div className="w-8 h-8 rounded bg-gray-500 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">银行卡</p>
                      <p className="text-xs text-muted-foreground">Visa / Mastercard</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 h-12 text-lg"
            onClick={handlePay}
          >
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            确认支付 ¥{finalPrice}
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>安全支付</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span>7天无理由退款</span>
            </div>
            <div className="flex items-center gap-1">
              <Gift className="h-3 w-3" />
              <span>价格保护</span>
            </div>
          </div>
        </div>
      )}

      {step === 'pay' && (
        <Card className="text-center py-8">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">支付成功！</h2>
              <p className="text-muted-foreground">感谢您的购买，欢迎使用智创云</p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600">
                  立即开始使用
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              会员已开通，可前往 <Link href="/dashboard" className="text-primary">控制台</Link> 查看详情
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
