import { StyleSheet, Text, View } from "react-native";
import { LayoutSlot } from "@/components/layout-slot";
import { FlowPrimaryButton, flowColors } from "@/components/flow-ui";
import {
  purchaseActionState,
  type ProductStatus,
} from "@/services/productCatalog";
import { useDelayedVisibility } from "@/components/feedback-ui";

export function PurchaseAction({
  displayPrice,
  productStatus,
  busy,
  unboundPurchase,
  disabled,
  onPress,
  onRetry,
  layoutPrefix,
}: {
  displayPrice: string;
  productStatus: ProductStatus;
  busy: boolean;
  unboundPurchase: boolean;
  disabled: boolean;
  onPress(): void;
  onRetry(): void;
  layoutPrefix: string;
}) {
  const action = purchaseActionState({
    productStatus,
    displayPrice,
    busy,
    unboundPurchase,
  });
  const showPriceLoading = useDelayedVisibility(action.loadingPrice);

  return (
    <View style={styles.group}>
      <FlowPrimaryButton
        label={action.label}
        onPress={action.retryPrice ? onRetry : onPress}
        disabled={disabled || action.loadingPrice}
        loading={busy || showPriceLoading}
        haptic={action.retryPrice}
        layoutId={`${layoutPrefix}.button`}
        labelLayoutId={`${layoutPrefix}.label`}
      />
      {!unboundPurchase ? (
        <LayoutSlot id={`${layoutPrefix}.price`}>
          <View
            style={[
              styles.priceWell,
              Boolean(displayPrice) && styles.readyPriceWell,
            ]}
          >
            <Text selectable style={styles.price}>
              {displayPrice ? (
                <>
                  <Text style={styles.priceAmount}>{displayPrice}</Text>
                  {" • One-time purchase"}
                </>
              ) : action.loadingPrice ? (
                "One-time purchase"
              ) : (
                "Apple price unavailable"
              )}
            </Text>
          </View>
        </LayoutSlot>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { width: "100%", alignItems: "center", gap: 6 },
  priceWell: {
    maxWidth: "100%",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
  },
  readyPriceWell: {
    backgroundColor: "#F3E7C8",
    borderWidth: 1,
    borderColor: "#D8B66A",
  },
  priceAmount: { fontSize: 21, lineHeight: 27, fontWeight: "800" },
  price: {
    color: flowColors.accessibleLink,
    fontSize: 14,
    lineHeight: 27,
    fontWeight: "700",
    textAlign: "center",
  },
});
