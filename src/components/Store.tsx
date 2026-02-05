import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ShoppingBag,
  Coins,
  Award,
  Palette,
  Crown,
  Zap,
  Check,
  Lock,
  Sparkles,
  Package,
  DollarSign,
  Tag,
  Clock
} from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  icon: string;
  metadata: any;
  is_active: boolean;
  discount_percentage?: number;
  original_price?: number;
  sale_ends_at?: string;
  owned?: boolean;
}

interface UserProfile {
  points_balance: number;
  points_earned_total: number;
}

interface TaxSettings {
  purchase_tax_rate: number;
}

export default function Store() {
  const { user } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('points_balance, points_earned_total')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    setProfile(data);
  }, [user]);

  const loadStore = useCallback(async () => {
    if (!user) return;

    const { data: storeItems, error: itemsError } = await supabase
      .from('store_items')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (itemsError) {
      console.error('Error loading store items:', itemsError);
      setLoading(false);
      return;
    }

    const { data: purchases, error: purchasesError } = await supabase
      .from('user_purchases')
      .select('item_id')
      .eq('user_id', user.id);

    if (purchasesError) {
      console.error('Error loading purchases:', purchasesError);
    }

    const ownedItemIds = new Set(purchases?.map(p => p.item_id) || []);

    const itemsWithOwnership = (storeItems || []).map(item => ({
      ...item,
      owned: ownedItemIds.has(item.id)
    }));

    setItems(itemsWithOwnership);
    setLoading(false);
  }, [user]);

  const loadTaxSettings = useCallback(async () => {
    const { data } = await supabase
      .from('tax_settings')
      .select('purchase_tax_rate')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setTaxSettings(data);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadStore();
      loadProfile();
      loadTaxSettings();
    }

    // Real-time subscription for store items
    const storeChannel = supabase
      .channel('store_items_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_items',
        },
        () => {
          loadStore();
        }
      )
      .subscribe();

    // Real-time subscription for user profile (points balance)
    const profileChannel = supabase
      .channel('user_profiles_store_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: user ? `user_id=eq.${user.id}` : undefined,
        },
        () => {
          loadProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storeChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user, loadStore, loadProfile, loadTaxSettings]);

  const purchaseItem = async (itemId: string, price: number) => {
    if (!user || !profile) return;

    if (profile.points_balance < price) {
      alert('Not enough points!');
      return;
    }

    setPurchasing(itemId);

    const { data, error } = await supabase.rpc('purchase_store_item', {
      p_user_id: user.id,
      p_item_id: itemId
    });

    if (error) {
      console.error('Error purchasing item:', error);
      alert('Failed to purchase item. Please try again.');
    } else if (data && !data.success) {
      alert(data.error || 'Failed to purchase item');
    } else {
      await loadStore();
      await loadProfile();
    }

    setPurchasing(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'badge':
        return Award;
      case 'theme':
        return Palette;
      case 'title':
        return Crown;
      case 'boost':
        return Zap;
      case 'feature':
        return Sparkles;
      default:
        return Package;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'badge':
        return 'from-yellow-400 to-yellow-600';
      case 'theme':
        return 'from-blue-400 to-blue-600';
      case 'title':
        return 'from-purple-400 to-purple-600';
      case 'boost':
        return 'from-orange-400 to-orange-600';
      case 'feature':
        return 'from-green-400 to-green-600';
      default:
        return 'from-slate-400 to-slate-600';
    }
  };

  const filteredItems = items.filter(item =>
    filter === 'all' || item.category === filter
  );

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'badge', label: 'Badges' },
    { id: 'theme', label: 'Themes' },
    { id: 'title', label: 'Titles' },
    { id: 'boost', label: 'Boosts' },
    { id: 'feature', label: 'Features' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-24">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 flex items-center gap-2">
          <ShoppingBag size={24} />
          Points Store
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Spend your earned points on exclusive items and features
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 mb-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins size={24} />
              <h3 className="text-lg sm:text-xl font-bold">Your Points</h3>
            </div>
            <p className="text-blue-100 text-sm">Earned from badges and activities</p>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">
              {profile?.points_balance?.toLocaleString() || 0}
            </div>
            <div className="text-blue-100 text-sm">
              {profile?.points_earned_total?.toLocaleString() || 0} total earned
            </div>
          </div>
        </div>
      </div>

      {items.some(item => item.discount_percentage && item.discount_percentage > 0 && item.sale_ends_at && new Date(item.sale_ends_at) > new Date()) && (
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-lg p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Tag size={32} className="flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold">Monthly Sale Event!</h3>
              <p className="text-red-100">Huge discounts on selected items - Limited time only!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-3xl font-bold">75%</div>
              <div className="text-xs text-red-100">Max Discount</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-3xl font-bold">{items.filter(item => item.discount_percentage && item.discount_percentage > 0 && item.sale_ends_at && new Date(item.sale_ends_at) > new Date()).length}</div>
              <div className="text-xs text-red-100">Items on Sale</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-3xl font-bold">
                {Math.ceil((new Date(items.find(item => item.sale_ends_at)?.sale_ends_at || new Date()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-xs text-red-100">Days Left</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">Save Big</div>
              <div className="text-xs text-red-100">Limited Stock</div>
            </div>
          </div>
        </div>
      )}

      {taxSettings && taxSettings.purchase_tax_rate > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <DollarSign className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Purchase Tax Applied</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                A {taxSettings.purchase_tax_rate}% tax is applied to all purchases. Your tax points are split equally: 50% rewards PaaS developers who build features for the community, and 50% goes to the reserve fund for economic stability.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <Package className="mx-auto mb-3 text-slate-400" size={48} />
          <p className="text-slate-500 dark:text-slate-400">No items found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category);
            const taxRate = taxSettings?.purchase_tax_rate || 1.5;
            const taxAmount = Math.ceil(item.price * (taxRate / 100));
            const totalCost = item.price + taxAmount;
            const canAfford = (profile?.points_balance || 0) >= totalCost;
            const outOfStock = item.stock === 0;
            const isOnSale = item.discount_percentage && item.discount_percentage > 0 && item.sale_ends_at;
            const saleEndsAt = item.sale_ends_at ? new Date(item.sale_ends_at) : null;
            const now = new Date();
            const saleActive = saleEndsAt && saleEndsAt > now;
            const daysRemaining = saleEndsAt ? Math.ceil((saleEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden ${
                  item.owned ? 'ring-2 ring-green-500' : ''
                } ${isOnSale && saleActive ? 'ring-2 ring-red-500' : ''}`}
              >
                {item.owned && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Check size={16} />
                    </div>
                  </div>
                )}

                {isOnSale && saleActive && !item.owned && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                      <Tag size={14} />
                      <span className="font-bold text-sm">{item.discount_percentage}% OFF</span>
                    </div>
                  </div>
                )}

                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center mx-auto mb-4 ${isOnSale && saleActive ? 'ring-4 ring-red-500/30' : ''}`}>
                  <CategoryIcon className="text-white" size={32} />
                </div>

                <div className="text-center mb-4">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {item.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      {isOnSale && saleActive && item.original_price && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-full">
                          <Coins size={12} className="text-slate-400" />
                          <span className="text-sm line-through text-slate-400 dark:text-slate-500">
                            {item.original_price.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${isOnSale && saleActive ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        <Coins size={14} className={isOnSale && saleActive ? 'text-white' : 'text-yellow-500'} />
                        <span className={`font-bold ${isOnSale && saleActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {isOnSale && saleActive && item.original_price && (
                      <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Save {(item.original_price - item.price).toLocaleString()} points!
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        + {taxAmount.toLocaleString()} tax ({taxRate}%) = <span className="font-semibold">{totalCost.toLocaleString()} total</span>
                      </div>
                    )}
                    {isOnSale && saleActive && daysRemaining > 0 && (
                      <div className="flex items-center justify-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                        <Clock size={12} />
                        <span>Sale ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {item.stock > 0 && item.stock < 10 && !item.owned && (
                  <div className="text-center text-xs text-orange-600 dark:text-orange-400 mb-3">
                    Only {item.stock} left!
                  </div>
                )}

                <button
                  onClick={() => purchaseItem(item.id, totalCost)}
                  disabled={item.owned || !canAfford || outOfStock || purchasing === item.id}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    item.owned
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-not-allowed'
                      : outOfStock
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
                      : !canAfford
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
                      : purchasing === item.id
                      ? 'bg-blue-400 text-white cursor-wait'
                      : isOnSale && saleActive
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {item.owned ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check size={16} />
                      Owned
                    </span>
                  ) : outOfStock ? (
                    <span className="flex items-center justify-center gap-2">
                      <Lock size={16} />
                      Out of Stock
                    </span>
                  ) : !canAfford ? (
                    <span className="flex items-center justify-center gap-2">
                      <Lock size={16} />
                      Not Enough Points
                    </span>
                  ) : purchasing === item.id ? (
                    'Purchasing...'
                  ) : (
                    'Purchase'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
