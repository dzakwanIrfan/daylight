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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionPlanType } from "@/types/subscription.types";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Loader2, Plus, X, Trash2 } from "lucide-react";
import { useAdminPlanMutations } from "@/hooks/use-admin-subscriptions";
import { useCountryOptions } from "@/hooks/use-admin-locations";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PriceInput {
  countryId: string;
  amount: number;
  isActive: boolean;
}

interface CreatePlanFormData {
  name: string;
  type: SubscriptionPlanType;
  description: string;
  prices: PriceInput[];
  durationInMonths: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export function CreatePlanDialog({
  open,
  onOpenChange,
}: CreatePlanDialogProps) {
  const { createPlan } = useAdminPlanMutations();
  const { data: countriesResponse, isLoading: loadingCountries } =
    useCountryOptions();
  const countries = countriesResponse || [];

  const [featureInput, setFeatureInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm<CreatePlanFormData>({
    defaultValues: {
      name: "",
      type: SubscriptionPlanType.MONTHLY_1,
      description: "",
      prices: [],
      durationInMonths: 1,
      features: [],
      isActive: true,
      sortOrder: 0,
    },
  });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control,
    name: "prices",
  });

  const features = watch("features");
  const prices = watch("prices");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setFeatureInput("");
    }
  }, [open, reset]);

  // Close dialog on success
  useEffect(() => {
    if (createPlan.isSuccess) {
      onOpenChange(false);
    }
  }, [createPlan.isSuccess, onOpenChange]);

  const onSubmit = async (data: CreatePlanFormData) => {
    if (data.prices.length === 0) {
      alert("Please add at least one price");
      return;
    }
    createPlan.mutate(data);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setValue("features", [...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setValue(
      "features",
      features.filter((_, i) => i !== index)
    );
  };

  const handleAddPrice = () => {
    appendPrice({
      countryId: "",
      amount: 0,
      isActive: true,
    });
  };

  const getCountryById = (countryId: string) => {
    return countries.find((c) => c.id === countryId);
  };

  const getAvailableCountries = (currentIndex: number) => {
    const selectedCountryIds = prices
      .map((p, i) => (i !== currentIndex ? p.countryId : null))
      .filter(Boolean);
    return countries.filter((c) => !selectedCountryIds.includes(c.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Subscription Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              placeholder="e.g., 1 Month Premium"
              {...register("name", { required: "Plan name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Plan Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Plan Type *</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Plan type is required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={SubscriptionPlanType.MONTHLY_1}>
                      1 Month Plan
                    </SelectItem>
                    <SelectItem value={SubscriptionPlanType.MONTHLY_3}>
                      3 Months Plan
                    </SelectItem>
                    <SelectItem value={SubscriptionPlanType.MONTHLY_6}>
                      6 Months Plan
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the plan benefits..."
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="durationInMonths">Duration (Months) *</Label>
            <Input
              id="durationInMonths"
              type="number"
              min="1"
              placeholder="1"
              {...register("durationInMonths", {
                required: "Duration is required",
                min: { value: 1, message: "Duration must be at least 1" },
                valueAsNumber: true,
              })}
            />
            {errors.durationInMonths && (
              <p className="text-xs text-red-600">
                {errors.durationInMonths.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Multi-Country Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Multi-Country Pricing *</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Add pricing for different countries. Currency will be
                  automatically set from the selected country.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPrice}
                disabled={
                  loadingCountries || priceFields.length >= countries.length
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Price
              </Button>
            </div>

            {priceFields.length === 0 && (
              <Card className="p-4 border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-500 text-center">
                  No prices added yet. Click "Add Price" to start.
                </p>
              </Card>
            )}

            <div className="space-y-3">
              {priceFields.map((field, index) => {
                const selectedCountry = getCountryById(
                  prices[index]?.countryId
                );
                const availableCountries = getAvailableCountries(index);

                return (
                  <Card key={field.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Price #{index + 1}
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrice(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Country Selector */}
                        <div className="space-y-2">
                          <Label className="text-xs">Country *</Label>
                          <Controller
                            name={`prices.${index}.countryId`}
                            control={control}
                            rules={{ required: "Country is required" }}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-[200px]">
                                  {availableCountries.map((country) => (
                                    <SelectItem
                                      key={country.id}
                                      value={country.id}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          {country.code}
                                        </span>
                                        <span className="text-xs">-</span>
                                        <span className="text-xs">
                                          {country.name}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                          <Label className="text-xs">Amount *</Label>
                          <div className="flex items-center gap-2">
                            {selectedCountry && (
                              <span className="text-xs font-medium text-gray-600 min-w-10">
                                {selectedCountry.currency}
                              </span>
                            )}
                            <Input
                              type="number"
                              min="0"
                              step="1000"
                              placeholder="150000"
                              className="h-9"
                              {...register(`prices.${index}.amount`, {
                                required: "Amount is required",
                                min: {
                                  value: 0,
                                  message: "Amount must be positive",
                                },
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Show selected country info */}
                      {selectedCountry && (
                        <div className="p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-900">
                            <span className="font-medium">
                              {selectedCountry.name}
                            </span>
                            {" • "}
                            Currency:{" "}
                            <span className="font-mono">
                              {selectedCountry.currency}
                            </span>
                            {" • "}
                            Code:{" "}
                            <span className="font-mono">
                              {selectedCountry.code}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature..."
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status and Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? "active" : "inactive"}
                    onValueChange={(value) =>
                      field.onChange(value === "active")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                placeholder="0"
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPlan.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPlan.isPending || priceFields.length === 0}
              className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
            >
              {createPlan.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
