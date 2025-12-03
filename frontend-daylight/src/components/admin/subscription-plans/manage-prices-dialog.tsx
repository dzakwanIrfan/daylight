"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  SubscriptionPlan,
  SubscriptionPlanPrice,
} from "@/types/subscription.types";
import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePlanPricesMutations } from "@/hooks/use-subscription-prices";
import { useCountryOptions } from "@/hooks/use-admin-locations";

interface ManagePricesDialogProps {
  plan: SubscriptionPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PriceFormData {
  countryId: string;
  amount: number;
  isActive: boolean;
}

export function ManagePricesDialog({
  plan,
  open,
  onOpenChange,
}: ManagePricesDialogProps) {
  const { addPrice, updatePrice, deletePrice } = usePlanPricesMutations();
  const { data: countriesResponse, isLoading: loadingCountries } =
    useCountryOptions();

  const countries = countriesResponse || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newPrice, setNewPrice] = useState<PriceFormData>({
    countryId: "",
    amount: 0,
    isActive: true,
  });

  const prices = plan.prices || [];

  // Get country details for display
  const getCountryDetails = (countryCode: string) => {
    return countries.find((c) => c.code === countryCode);
  };

  // Get available countries (not already in prices)
  const availableCountries = countries.filter(
    (country) => !prices.some((p) => p.countryCode === country.code)
  );

  const handleAddPrice = async () => {
    if (!newPrice.countryId || newPrice.amount <= 0) return;

    await addPrice.mutateAsync({
      planId: plan.id,
      price: newPrice,
    });

    // Reset form
    setNewPrice({
      countryId: "",
      amount: 0,
      isActive: true,
    });
    setIsAdding(false);
  };

  const handleDeletePrice = async (priceId: string) => {
    if (prices.length <= 1) {
      alert(
        "Cannot delete the last price.  A plan must have at least one price."
      );
      return;
    }

    if (confirm("Are you sure you want to delete this price?")) {
      await deletePrice.mutateAsync(priceId);
    }
  };

  const handleToggleActive = async (price: SubscriptionPlanPrice) => {
    await updatePrice.mutateAsync({
      priceId: price.id,
      data: { isActive: !price.isActive },
    });
  };

  const selectedCountry = countries.find((c) => c.id === newPrice.countryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Multi-Country Prices</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {plan.name} • {plan.type}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Prices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Current Prices</h3>
              <Badge variant="outline">{prices.length} price(s)</Badge>
            </div>

            {loadingCountries ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading prices...
              </div>
            ) : (
              <div className="space-y-2">
                {prices.map((price) => {
                  const country = getCountryDetails(price.countryCode || "");
                  return (
                    <Card key={price.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-900">
                              {price.currency} {price.amount.toLocaleString()}
                            </span>
                            <Badge
                              variant={price.isActive ? "default" : "secondary"}
                            >
                              {price.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {country && (
                              <Badge variant="outline">
                                {country.code} - {country.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {country
                              ? `${country.name} (${country.currency})`
                              : "Unknown Country"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(price)}
                            disabled={updatePrice.isPending}
                          >
                            {price.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePrice(price.id)}
                            disabled={
                              deletePrice.isPending || prices.length <= 1
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Add New Price */}
          {!isAdding ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="w-full"
              disabled={availableCountries.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              {availableCountries.length === 0
                ? "All countries have been added"
                : "Add New Price"}
            </Button>
          ) : (
            <Card className="p-4 border-2 border-brand">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Add New Price</h3>

                {/* Country Selector */}
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select
                    value={newPrice.countryId}
                    onValueChange={(value) =>
                      setNewPrice({ ...newPrice, countryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[300px]">
                      {availableCountries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{country.code}</span>
                            <span>-</span>
                            <span>{country.name}</span>
                            <span className="text-xs text-gray-500">
                              ({country.currency})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Currency and country code will be automatically set from the
                    selected country
                  </p>
                </div>

                {/* Show selected country info */}
                {selectedCountry && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      Selected: {selectedCountry.name}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Currency: {selectedCountry.currency} | Country Code:{" "}
                      {selectedCountry.code}
                    </p>
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <div className="flex items-center gap-2">
                    {selectedCountry && (
                      <span className="text-sm font-medium text-gray-600">
                        {selectedCountry.currency}
                      </span>
                    )}
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={newPrice.amount || ""}
                      onChange={(e) =>
                        setNewPrice({
                          ...newPrice,
                          amount: Number(e.target.value),
                        })
                      }
                      placeholder="150000"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewPrice({
                        countryId: "",
                        amount: 0,
                        isActive: true,
                      });
                    }}
                    disabled={addPrice.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddPrice}
                    disabled={
                      addPrice.isPending ||
                      !newPrice.countryId ||
                      newPrice.amount <= 0
                    }
                    className="bg-brand hover:bg-brand-dark"
                  >
                    {addPrice.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Price
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
