
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react';

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface BuyerDetailModalProps {
  buyer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const BuyerDetailModal: React.FC<BuyerDetailModalProps> = ({
  buyer,
  isOpen,
  onClose,
}) => {
  if (!buyer) return null;

  const getStatusColor = (customer: Customer) => {
    const createdAt = new Date(customer.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreation <= 30) {
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    } else if (daysSinceCreation <= 90) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusText = (customer: Customer) => {
    const createdAt = new Date(customer.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreation <= 30) {
      return "Active";
    } else if (daysSinceCreation <= 90) {
      return "Recent";
    } else {
      return "Inactive";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Buyer Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Customer ID</h3>
              <p className="text-lg font-mono">#{buyer._id.slice(-8)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Status</h3>
              <Badge className={getStatusColor(buyer)}>
                {getStatusText(buyer)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                <p className="font-medium">{buyer.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium">{buyer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium">{buyer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Join Date</p>
                <p className="font-medium">{formatDate(buyer.createdAt)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                {buyer.address.street}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {buyer.address.city}, {buyer.address.state} {buyer.address.zipCode}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {buyer.address.country}
              </p>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Account Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDate(buyer.createdAt)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Created</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatDate(buyer.updatedAt)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Last Updated</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyerDetailModal;
