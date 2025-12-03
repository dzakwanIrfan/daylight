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
import type { SubscriptionPlan } from "@/types/subscription.types";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Plus, X } from "lucide-react";
import { useAdminPlanMutations } from "@/hooks/use-admin-subscriptions";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface EditPlanDialogProps {
  plan: SubscriptionPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditPlanFormData {
  name: string;
  description: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export function EditPlanDialog({
  plan,
  open,
  onOpenChange,
}: EditPlanDialogProps) {
  const { updatePlan } = useAdminPlanMutations();
  const [featureInput, setFeatureInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm<EditPlanFormData>({
    defaultValues: {
      name: plan.name,
      description: plan.description || "",
      features: plan.features || [],
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    },
  });

  const features = watch("features");

  // Reset form when plan changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        name: plan.name,
        description: plan.description || "",
        features: plan.features || [],
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      });
      setFeatureInput("");
    }
  }, [plan, open, reset]);

  // Close dialog on success
  useEffect(() => {
    if (updatePlan.isSuccess) {
      onOpenChange(false);
    }
  }, [updatePlan.isSuccess, onOpenChange]);

  const onSubmit = async (data: EditPlanFormData) => {
    updatePlan.mutate({ id: plan.id, data });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Update plan details. To manage pricing, use "Manage Prices" action.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Plan Info (Read-only) */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plan Type</p>
                <Badge variant="outline" className="mt-1">
                  {plan.type}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-sm text-gray-900 mt-1">
                  {plan.durationInMonths} month
                  {plan.durationInMonths > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {plan.prices && plan.prices.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Current Prices ({plan.prices.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {plan.prices.slice(0, 3).map((price, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {price.currency} {price.amount.toLocaleString()}
                      {price.countryCode && ` (${price.countryCode})`}
                    </Badge>
                  ))}
                  {plan.prices.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{plan.prices.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

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
              disabled={updatePlan.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatePlan.isPending}
              className="bg-brand hover:bg-brand-dark border border-black text-white font-bold"
            >
              {updatePlan.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
