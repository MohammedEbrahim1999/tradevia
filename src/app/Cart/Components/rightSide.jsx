"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function RightSide({ total = 0, shipping = [], cartItems = [] }) {
  const router = useRouter();
  const [shipCost, setShipCost] = useState(0);
  console.log(cartItems);

  const [couponCode, setCouponCode] = useState("");
  const [discounts, setDiscounts] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  // ✅ payment
  const [paymentMethod, setPaymentMethod] = useState(""); // "card" | "mada" | "applepay" | "cod"
  const [payError, setPayError] = useState("");

  // ✅ address
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [addressError, setAddressError] = useState("");

  // ✅ logged customer resolved by token
  const [customerId, setCustomerId] = useState(""); // loggedCustomers.id
  const [tokenError, setTokenError] = useState("");

  // ✅ resolved token
  const [resolvedToken, setResolvedToken] = useState(""); // "#U888884"

  // ✅ UI state for COD confirm
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  // =========================
  // APIs
  // =========================
  const API_COUPONS = "http://localhost:5000/discounts";
  const API_ADDRESSES = "http://localhost:5000/customerAddresses";
  const API_LOGGED_CUSTOMERS = "http://localhost:5000/loggedCustomers";

  // orders + cart
  const API_ORDERS = "http://localhost:5000/orders";
  const API_CART = "http://localhost:5000/cart";

  // ✅ totalPrice endpoint (db.json: "totalPrice": [])
  const API_TOTAL_PRICE = "http://localhost:5000/totalPrice";

  // Optional: add fee for COD
  const COD_FEE = 0; // e.g. 15

  // =========================
  // Helpers: token + matching
  // =========================
  function getUserToken() {
    return (
      (typeof window !== "undefined" && localStorage.getItem("userTokens")) ||
      (typeof window !== "undefined" && localStorage.getItem("userToken")) ||
      (typeof window !== "undefined" && localStorage.getItem("token")) ||
      ""
    );
  }

  function normalizeToken(t) {
    return String(t || "").trim();
  }

  function tokenMatchesRow(row, token) {
    const t = normalizeToken(token);
    if (!t) return false;
    return normalizeToken(row?.userTokens) === t;
  }

  function resolveCustomerIdFromRow(row) {
    return row?.id ?? "";
  }

  // ✅ Generate order id like: #1248645
  function generateOrderId() {
    const n = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
    return `#${n}`;
  }

  // ✅ Generate small random id for totalPrice row if we need to create it
  function genSmallId() {
    return Math.random().toString(16).slice(2, 6); // e.g. "080d"
  }

  // ✅ Build address snapshot to store inside the order
  function buildOrderAddressSnapshot(a) {
    if (!a) return null;

    const fullName = a?.fullName || a?.receiverName || a?.name || "";
    const phone = a?.phone || a?.mobile || "";

    const line1 =
      a?.addressLine ||
      a?.address1 ||
      a?.addressLine1 ||
      [a?.street, a?.district].filter(Boolean).join(", ");

    const line2 =
      a?.addressLine2 ||
      a?.address2 ||
      [a?.city, a?.state || a?.region].filter(Boolean).join(", ");

    return {
      id: String(a?.id ?? ""),
      label: a?.label || a?.title || "",
      isDefault: !!a?.isDefault,

      fullName,
      phone,

      line1: line1 || "",
      line2: line2 || "",

      city: a?.city || "",
      region: a?.state || a?.region || "",
      country: a?.country || "",
      postalCode: a?.postalCode || a?.zip || "",

      raw: a,
    };
  }

  // ✅ Extract sellerId as NUMBER from a product/cart row
  function getSellerIdNumber(it) {
    const raw =
      it?.sellerId ??
      it?.sellerID ??
      it?.seller ??
      it?.vendorId ??
      it?.vendorID ??
      it?.storeId ??
      it?.shopId ??
      0;

    return Number(raw) || 0;
  }

  // ✅ pick salePrice if exists, else price
  function pickUnitPrice(it) {
    const sale =
      Number(it?.salePrice ?? it?.sale_price ?? it?.discountPrice ?? it?.offerPrice ?? 0) || 0;

    const price =
      Number(it?.price ?? it?.unitPrice ?? it?.productPrice ?? 0) || 0;

    // use sale only if > 0 (or you can change rule to: if not null)
    return sale > 0 ? sale : price;
  }

  // =========================
  // UI Helpers
  // =========================
  const Money = ({ value, strong = false }) => (
    <span
      className={
        strong ? "font-extrabold text-gray-900" : "font-semibold text-gray-900"
      }
    >
      {Number(value || 0).toFixed(2)}{" "}
      <span className="text-[11px] font-bold text-gray-500">SAR</span>
    </span>
  );

  const Chip = ({ children, tone = "gray" }) => {
    const map = {
      gray: "bg-white/70 text-gray-700 border-gray-200",
      dark: "bg-gray-900 text-white border-gray-900",
      green: "bg-emerald-600 text-white border-emerald-600",
      amber: "bg-amber-100 text-amber-900 border-amber-200",
      sky: "bg-sky-100 text-sky-900 border-sky-200",
      red: "bg-red-100 text-red-900 border-red-200",
    };

    return (
      <span
        className={[
          "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold",
          "shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur",
          map[tone] || map.gray,
        ].join(" ")}
      >
        {children}
      </span>
    );
  };

  const RadioDot = ({ active }) => (
    <span
      className={[
        "grid h-5 w-5 place-items-center rounded-full border transition",
        active ? "border-sky-500" : "border-gray-300",
      ].join(" ")}
      aria-hidden
    >
      <span
        className={[
          "h-2.5 w-1.5 rounded-full transition",
          active ? "bg-sky-500" : "bg-transparent",
        ].join(" ")}
      />
    </span>
  );

  // =========================
  // Payment Methods (UI DATA)
  // =========================
  const PAYMENT_METHODS = useMemo(
    () => [
      {
        id: "card",
        label: "Credit / Debit Card",
        desc: "Visa, MasterCard, AMEX",
        icon: "💳",
        badge: { text: "Recommended", tone: "dark" },
        details: [
          "Instant confirmation",
          "Secure card payments",
          "Best for international cards",
        ],
      },
      {
        id: "mada",
        label: "Mada",
        desc: "Saudi local cards",
        icon: "🇸🇦",
        badge: { text: "Local", tone: "sky" },
        details: [
          "Instant confirmation",
          "Best for local Mada cards",
          "Secure checkout",
        ],
      },
      {
        id: "applepay",
        label: "Apple Pay",
        desc: "Fast checkout on Apple devices",
        icon: "",
        badge: { text: "Fast", tone: "green" },
        details: ["One-tap payment", "Face ID / Touch ID", "Apple device required"],
      },
      {
        id: "cod",
        label: "Cash on Delivery",
        desc: "Pay when you receive your order",
        icon: "💵",
        badge: null,
        details: [
          "Pay the courier on delivery",
          "Good if you don’t want online payment",
          COD_FEE > 0
            ? `Includes +${Number(COD_FEE).toFixed(2)} SAR fee`
            : "No extra fee",
        ],
      },
    ],
    []
  );

  const selectedAddress = useMemo(
    () => addresses.find((a) => String(a?.id) === String(addressId)) || null,
    [addresses, addressId]
  );

  // =========================
  // Fetch Coupons
  // =========================
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await fetch(API_COUPONS);
        if (!res.ok) throw new Error("Failed to fetch coupons");
        const data = await res.json();
        setDiscounts(Array.isArray(data) ? data : []);
      } catch (err) {
        setCouponError(err?.message || "Failed to load coupons");
      }
    };
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // 1) Resolve token + customerId by checking loggedCustomers
  // =========================
  useEffect(() => {
    const run = async () => {
      setTokenError("");
      setCustomerId("");
      setResolvedToken("");

      const token = getUserToken();
      if (!token) {
        setTokenError("No user token found. Please login first.");
        return;
      }

      const normToken = normalizeToken(token);

      try {
        const res = await fetch(API_LOGGED_CUSTOMERS);
        if (!res.ok) throw new Error("Failed to fetch loggedCustomers");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        const row = list.find((x) => tokenMatchesRow(x, normToken));
        if (!row) {
          setTokenError("Token not found in loggedCustomers. Please login again.");
          return;
        }

        const id = resolveCustomerIdFromRow(row);
        if (!id) {
          setTokenError("Could not resolve customer id from loggedCustomers.");
          return;
        }

        setResolvedToken(normToken);
        setCustomerId(String(id));
      } catch (err) {
        setTokenError(err?.message || "Failed to resolve customer session");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // 2) Fetch Addresses BY userTokens
  // =========================
  useEffect(() => {
    const fetchAddresses = async () => {
      setAddressError("");
      setAddresses([]);
      setAddressId("");

      if (!resolvedToken) return;

      try {
        const tryUrl = `${API_ADDRESSES}?userTokens=${encodeURIComponent(
          resolvedToken
        )}`;
        const res = await fetch(tryUrl);

        let list = [];
        if (res.ok) {
          const data = await res.json();
          list = Array.isArray(data) ? data : [];
        } else {
          const resAll = await fetch(API_ADDRESSES);
          if (!resAll.ok) throw new Error("Failed to fetch addresses");
          const dataAll = await resAll.json();
          const all = Array.isArray(dataAll) ? dataAll : [];
          list = all.filter(
            (a) => normalizeToken(a?.userTokens) === normalizeToken(resolvedToken)
          );
        }

        setAddresses(list);

        const def = list.find((x) => x?.isDefault) || list[0] || null;
        setAddressId(def ? String(def.id) : "");
      } catch (err) {
        setAddressError(err?.message || "Failed to load addresses");
      }
    };

    fetchAddresses();
  }, [resolvedToken]);

  // =========================
  // Shipping Calculation
  // =========================
  useEffect(() => {
    if (!shipping.length || isNaN(total)) {
      setShipCost(0);
      return;
    }

    const ship = shipping[0] || {};
    let cost = 0;

    if (total >= 1500) cost = ship.free;
    else if (total >= 1001) cost = ship.less;
    else if (total >= 501) cost = ship.low;
    else if (total >= 250) cost = ship.medium;
    else if (total === 0) cost = 0;
    else cost = ship.high;

    setShipCost(Number(cost) || 0);
  }, [total, shipping]);

  // =========================
  // Reset COD confirm when payment changes
  // =========================
  useEffect(() => {
    setCheckoutMessage("");
    if (paymentMethod !== "cod") setCodConfirmed(false);
  }, [paymentMethod]);

  // =========================
  // Apply Coupon
  // =========================
  const applyCoupon = () => {
    setCouponError("");
    setDiscount(0);

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const code = couponCode.trim().toUpperCase();
    const today = new Date();

    const coupon = discounts.find((c) => (c?.code || "").toUpperCase() === code);

    if (!coupon) {
      setCouponError("Invalid coupon code");
      return;
    }

    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);

    if (today < validFrom || today > validTo) {
      setCouponError("This coupon has expired");
      return;
    }

    if (Number(coupon.timesUsed) >= Number(coupon.usageLimit)) {
      setCouponError("Coupon usage limit reached");
      return;
    }

    const pct = Number(coupon.discountPercentage) || 0;
    const discountValue = (Number(total) * pct) / 100;

    setDiscount(discountValue);
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setCouponError("");
  };

  // =========================
  // Totals
  // =========================
  const payFee = paymentMethod === "cod" ? Number(COD_FEE) : 0;
  const finalTotal =
    Number(total) + Number(shipCost) + Number(payFee) - Number(discount);

  const baseCanCheckout =
    finalTotal > 0 && !!paymentMethod && !!addressId && !!customerId;
  const canCheckout =
    paymentMethod === "cod" ? baseCanCheckout && codConfirmed : baseCanCheckout;

  // =========================
  // Set totalPrice to 0 for user token
  // =========================
  async function setTotalPriceToZeroByToken(userTokens) {
    const token = normalizeToken(userTokens);
    if (!token) return;

    const res = await fetch(
      `${API_TOTAL_PRICE}?userTokens=${encodeURIComponent(token)}`
    );

    let rows = [];
    if (res.ok) {
      const data = await res.json();
      rows = Array.isArray(data) ? data : [];
    }

    if (rows.length) {
      const row = rows[0];
      const patch = await fetch(`${API_TOTAL_PRICE}/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice: 0 }),
      });
      if (!patch.ok) throw new Error("Failed to update totalPrice to 0");
      return;
    }

    const create = await fetch(API_TOTAL_PRICE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: genSmallId(),
        userTokens: token,
        totalPrice: 0,
      }),
    });
    if (!create.ok) throw new Error("Failed to create totalPrice row");
  }

  // =========================
  // ✅ Create order + clear cart for COD
  // =========================
  async function createOrderAndClearCartCOD() {
    const customerName =
      selectedAddress?.fullName ||
      selectedAddress?.receiverName ||
      selectedAddress?.name ||
      "Customer";

    const orderAddress = buildOrderAddressSnapshot(selectedAddress);

    // ✅ 1) Raw list (from props OR from API)
    let rawList = Array.isArray(cartItems) ? cartItems : [];

    if (!rawList.length && resolvedToken) {
      const resCart = await fetch(
        `${API_CART}?userTokens=${encodeURIComponent(resolvedToken)}`
      );
      if (resCart.ok) {
        const cartList = await resCart.json();
        rawList = Array.isArray(cartList) ? cartList : [];
      }
    }

    // ✅ 2) ORDER sellerId (ONE VALUE) as NUMBER -> "sellerId": 1
    const sellerId = getSellerIdNumber(rawList?.[0]);

    if (!sellerId) {
      throw new Error("Seller ID not found on cart products.");
    }
    // ✅ Get product image from cart/product row
    function pickProductImage(it) {
      return (
        it?.image ||
        it?.img ||
        it?.thumbnail ||
        it?.thumb ||
        it?.photo ||
        it?.imageUrl ||
        it?.imageURL ||
        it?.productImage ||
        it?.productImageUrl ||
        it?.images?.[0] ||
        it?.gallery?.[0] ||
        ""
      );
    }

    // ✅ 3) Items WITHOUT sellerId inside []
    // ✅ UPDATED: unitPrice uses salePrice if exists, else price
    const finalItems = (rawList || []).map((it, idx) => {
      const quantity = Number(it?.quantity ?? it?.qty ?? 1) || 1;

      const unitPrice = pickUnitPrice(it);
      const image = pickProductImage(it);
      return {
        id: String(it?.id ?? it?.productId ?? `p${idx + 1}`),
        productName: String(it?.productName ?? it?.title ?? it?.name ?? "Product"),
        quantity,
        unitPrice,
        image,
      };
    });

    const orderPayload = {
      orderId: generateOrderId(),
      userId: Number(customerId) || customerId,

      // ✅ HERE (not inside items)
      sellerId, // number => 1

      customer: customerName,
      items: finalItems,
      totalPrice: Number(finalTotal),
      status: "Pending",
      userTokens: resolvedToken,
      createdAt: new Date().toISOString(),

      addressId: String(addressId),
      address: orderAddress,

      shipCost: Number(shipCost),
      discount: Number(discount),
      paymentMethod: "cod",
    };

    // 1) POST order
    const resOrder = await fetch(API_ORDERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    if (!resOrder.ok) throw new Error("Failed to create order");

    // 2) Clear cart rows for same token
    const resCart = await fetch(
      `${API_CART}?userTokens=${encodeURIComponent(resolvedToken)}`
    );
    if (resCart.ok) {
      const list = await resCart.json();
      const cartList = Array.isArray(list) ? list : [];
      await Promise.all(
        cartList.map((row) => fetch(`${API_CART}/${row.id}`, { method: "DELETE" }))
      );
    }

    // 3) Set totalPrice to 0
    await setTotalPriceToZeroByToken(resolvedToken);

    const createdOrder = await resOrder.json().catch(() => null);
    return createdOrder || orderPayload;
  }

  // =========================
  // Checkout Action
  // =========================
  const handleCheckout = async () => {
    if (placingOrder) return;

    setPayError("");
    setAddressError("");
    setCheckoutMessage("");

    if (!customerId) {
      setAddressError(tokenError || "Please login to continue.");
      return;
    }

    if (!addressId) {
      setAddressError("Please choose a delivery address to continue.");
      return;
    }

    if (!paymentMethod) {
      setPayError("Please choose a payment method to continue.");
      return;
    }

    if (paymentMethod === "cod" && !codConfirmed) {
      setPayError("Please confirm Cash on Delivery to place your order.");
      return;
    }

    try {
      setPlacingOrder(true);

      if (paymentMethod === "cod") {
        const created = await createOrderAndClearCartCOD();

        // ✅ store last order id
        try {
          localStorage.setItem("lastOrderId", String(created?.orderId || ""));
        } catch { }

        // ✅ store full order snapshot (optional)
        try {
          sessionStorage.setItem("lastOrderData", JSON.stringify(created));
        } catch { }

        // ✅ redirect with orderId in URL
        const oid = encodeURIComponent(String(created?.orderId || ""));
        router.push(`/ThanksPage?orderId=${oid}`);
        return;
      }

      setCheckoutMessage("✅ Proceeding to payment...");
      router.push("/payment");
    } catch (err) {
      setPayError(err?.message || "Checkout failed. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // =========================
  // Payment Row (Premium UI)
  // =========================
  const PaymentRow = ({ m }) => {
    const active = paymentMethod === m.id;

    const select = () => {
      setPaymentMethod(m.id);
      setPayError("");
    };

    return (
      <div
        className={[
          "overflow-hidden rounded-2xl border bg-white transition",
          active
            ? "border-sky-200 ring-2 ring-sky-100 shadow-[0_10px_30px_rgba(2,132,199,0.12)]"
            : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={select}
          className={[
            "w-full p-3 text-left transition",
            "focus:outline-none focus:ring-2 focus:ring-sky-200",
            active
              ? "bg-gradient-to-b from-sky-50 to-white"
              : "hover:bg-gray-50",
          ].join(" ")}
          aria-pressed={active}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={[
                  "grid h-9 w-9 place-items-center rounded-2xl border text-lg",
                  active ? "border-sky-200 bg-white" : "border-gray-200 bg-white",
                ].join(" ")}
              >
                {m.icon}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-gray-900">{m.label}</p>
                  {m.badge ? <Chip tone={m.badge.tone}>{m.badge.text}</Chip> : null}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{m.desc}</p>
              </div>
            </div>

            <RadioDot active={active} />
          </div>
        </button>

        {active && (
          <div className="border-t border-gray-100 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-gray-800">What you get</p>
              {m.id === "cod" ? (
                <Chip tone="amber">Pay on delivery</Chip>
              ) : (
                <Chip tone="green">Secure</Chip>
              )}
            </div>

            <ul className="mt-2 space-y-1.5 text-xs text-gray-600">
              {m.details.map((x, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="min-w-0">{x}</span>
                </li>
              ))}
            </ul>

            {m.id === "cod" ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold text-amber-900">
                      Confirm Cash on Delivery
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800">
                      By confirming, you agree to pay the courier upon delivery.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCodConfirmed((v) => !v);
                      setPayError("");
                    }}
                    className={[
                      "shrink-0 rounded-2xl px-3 py-2 text-xs font-extrabold transition",
                      codConfirmed
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-gray-900 text-white hover:bg-black",
                    ].join(" ")}
                  >
                    {codConfirmed ? "Confirmed ✓" : "Confirm"}
                  </button>
                </div>

                {COD_FEE > 0 ? (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-white/60 px-3 py-2 text-xs text-amber-900">
                    Cash on Delivery fee: <b>{Number(COD_FEE).toFixed(2)} SAR</b>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  // =========================
  // Address Row (Premium UI)
  // =========================
  const AddressRow = ({ a }) => {
    const id = String(a?.id);
    const active = String(addressId) === id;

    const title =
      a?.label ||
      a?.title ||
      a?.name ||
      (a?.isDefault ? "Default Address" : "Address");

    const line1 =
      [a?.fullName || a?.receiverName, a?.phone].filter(Boolean).join(" • ") ||
      null;

    const line2 =
      a?.addressLine ||
      a?.address1 ||
      a?.addressLine1 ||
      [a?.street, a?.district, a?.city].filter(Boolean).join(", ");

    const line3 = [
      a?.addressLine2,
      a?.city,
      a?.state || a?.region,
      a?.country,
      a?.postalCode || a?.zip || a?.postalCode,
    ]
      .filter(Boolean)
      .join(" • ");

    const select = () => {
      setAddressId(id);
      setAddressError("");
    };

    return (
      <div
        className={[
          "overflow-hidden rounded-2xl border bg-white transition",
          active
            ? "border-emerald-200 ring-2 ring-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.14)]"
            : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={select}
          className={[
            "w-full p-3 text-left transition",
            "focus:outline-none focus:ring-2 focus:ring-emerald-200",
            active
              ? "bg-gradient-to-b from-emerald-50 to-white"
              : "hover:bg-gray-50",
          ].join(" ")}
          aria-pressed={active}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={[
                  "grid h-9 w-9 place-items-center rounded-2xl border text-lg",
                  active ? "border-emerald-200 bg-white" : "border-gray-200 bg-white",
                ].join(" ")}
                aria-hidden
              >
                📍
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-gray-900">{title}</p>
                  {a?.isDefault ? <Chip tone="green">Default</Chip> : null}
                </div>

                {line1 ? <p className="mt-0.5 text-xs text-gray-600">{line1}</p> : null}
                {line2 ? <p className="mt-0.5 text-xs text-gray-500">{line2}</p> : null}
                {line3 ? <p className="mt-0.5 text-xs text-gray-500">{line3}</p> : null}
              </div>
            </div>

            <RadioDot active={active} />
          </div>
        </button>
      </div>
    );
  };

  // =========================
  // Derived UI strings
  // =========================
  const shippingLabel =
    Number(total) === 0 ? "0.00 SAR" : shipCost === 0 ? "Free" : `${Number(shipCost).toFixed(2)} SAR`;

  const checkoutLabel =
    paymentMethod === "cod"
      ? placingOrder
        ? "Placing Order..."
        : "Confirm Order"
      : placingOrder
        ? "Loading..."
        : "Proceed to Checkout";

  // =========================
  // UI
  // =========================
  return (
    <div className="lg:sticky lg:top-6">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:max-h-[80vh]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_100%_0%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(70%_60%_at_0%_0%,rgba(16,185,129,0.14),transparent_60%)]" />

        <div className="relative p-4 lg:max-h-[80vh] lg:overflow-y-auto lg:pr-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Order Summary</h2>
              <p className="mt-1 text-xs text-gray-500">
                Review totals, address & payment to continue
              </p>
            </div>

            <Chip tone="green">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Secure
              </span>
            </Chip>
          </div>
          {/* Address */}
          <div className="mt-4">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-gray-900">Delivery Address</p>
                <div className="w-[340px] flex justify-between items-baseline">
                  <p className="mt-0.5 text-xs text-gray-500 flex-1">
                    Choose where we should deliver your order
                  </p>
                  {addressId ? <Chip tone="dark">Selected</Chip> : <Chip tone="amber">Required</Chip>}
                </div>
                {!customerId && (
                  <div className="w-fit flex items-center justify-between gap-3 bg-[#0587A7]/5 border border-[#0587A7]/20 text-gray-700 rounded-md px-3 py-2 text-sm my-3">

                    <div className="flex items-center gap-2 ">
                      <span className="w-2 h-2 rounded-full bg-[#0587A7]"></span>
                      <span>
                        Please
                        <a href="/Login" className="font-medium text-[#0587A7]"> Login </a>{" "}
                        to select your address
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {addressError ? (
              <p className="mb-2 text-xs font-semibold text-red-500">{addressError}</p>
            ) : null}

            {customerId && addresses.length ? (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <AddressRow key={String(a?.id)} a={a} />
                ))}
              </div>
            ) : customerId ? (
              <div className="rounded-2xl border border-gray-200 bg-white/80 p-3 text-sm text-gray-600">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-gray-900">No saved addresses</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Make sure your <b>customerAddresses</b> items include:{" "}
                      <b>userTokens: "{resolvedToken || "YOUR_TOKEN"}"</b>
                    </p>
                  </div>
                  <Chip tone="amber">Action needed</Chip>
                </div>

                {addressError ? (
                  <p className="mt-2 text-xs font-semibold text-red-500">{addressError}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Totals card */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white/80 p-3 backdrop-blur">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <Money value={total} />
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span
                  className={
                    shipCost === 0
                      ? "font-bold text-emerald-600"
                      : "font-semibold text-gray-900"
                  }
                >
                  {shippingLabel}
                </span>
              </div>

              {paymentMethod === "cod" && COD_FEE > 0 && (
                <div className="flex justify-between text-gray-900">
                  <span className="text-gray-600">COD fee</span>
                  <span className="font-semibold">
                    {Number(COD_FEE).toFixed(2)} SAR
                  </span>
                </div>
              )}

              {/* Coupon */}
              <div className="pt-1">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-extrabold text-gray-800">Coupon</p>
                  {discount > 0 ? <Chip tone="green">Applied</Chip> : <Chip tone="gray">Optional</Chip>}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. SAVE10)"
                    value={couponCode}
                    disabled={discount > 0}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100 disabled:bg-gray-100"
                  />

                  {discount > 0 ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-700 transition hover:bg-red-100"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="rounded-2xl bg-gray-900 px-4 text-sm font-extrabold text-white transition hover:bg-black"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {couponError && (
                  <p className="mt-2 text-xs font-semibold text-red-500">{couponError}</p>
                )}

                {discount > 0 && (
                  <div className="mt-3 flex justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                    <span className="text-xs font-extrabold">Discount</span>
                    <span className="text-xs font-extrabold">
                      -{Number(discount).toFixed(2)} SAR
                    </span>
                  </div>
                )}
              </div>

              <div className="my-2 h-px w-full bg-gray-100" />

              {/* Total */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-600">Total</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Includes shipping & discounts
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-extrabold text-gray-900">
                    {finalTotal > 0 ? finalTotal.toFixed(2) : "0.00"}{" "}
                    <span className="text-[12px] font-extrabold text-gray-500">SAR</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-4">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-gray-900">Payment Method</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Choose one method to enable checkout
                </p>
              </div>

              {paymentMethod ? <Chip tone="dark">Selected</Chip> : <Chip tone="amber">Required</Chip>}
            </div>

            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <PaymentRow key={m.id} m={m} />
              ))}
            </div>

            {payError && <p className="mt-2 text-xs font-semibold text-red-500">{payError}</p>}
          </div>

          {checkoutMessage ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="font-extrabold">{checkoutMessage}</p>
            </div>
          ) : null}

          {/* Checkout */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={!canCheckout || placingOrder}
            className={[
              "mt-4 w-full rounded-2xl py-3 font-extrabold text-white transition",
              "shadow-[0_10px_30px_rgba(14,165,233,0.25)]",
              canCheckout && !placingOrder
                ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-[1.03]"
                : "cursor-not-allowed bg-gray-300 shadow-none",
            ].join(" ")}
          >
            {checkoutLabel}
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Secure checkout • No hidden fees
          </div>

          {paymentMethod === "cod" && baseCanCheckout && !codConfirmed ? (
            <p className="mt-2 text-center text-[11px] text-amber-700">
              Please confirm Cash on Delivery to enable <b>Confirm Order</b>.
            </p>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-10 bg-gradient-to-t from-white to-transparent lg:block" />
      </div>
    </div>
  );
}
