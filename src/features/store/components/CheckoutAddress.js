"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { checkout, useCheckout } from "../cart";
import { CheckoutSteps, OrderSummary, WithCart } from "./CheckoutParts";

const FIELDS = [
  { k: "name", label: "Full name", autoComplete: "name", placeholder: "e.g. Ananya Sharma" },
  { k: "phone", label: "Mobile number", autoComplete: "tel-national", placeholder: "98765 43210", inputMode: "numeric", maxLength: 10 },
  { k: "line", label: "House no., building, street", autoComplete: "street-address", placeholder: "e.g. 12, Shanti Apartments, MG Road", wide: true },
  { k: "pincode", label: "Pincode", autoComplete: "postal-code", placeholder: "110001", inputMode: "numeric", maxLength: 6 },
  { k: "city", label: "City", autoComplete: "address-level2", placeholder: "e.g. New Delhi" },
  { k: "state", label: "State", autoComplete: "address-level1", placeholder: "e.g. Delhi" },
];

const validate = (a) => {
  const err = {};
  if (a.name.trim().length < 2) err.name = "Please enter your full name";
  if (!/^[6-9]\d{9}$/.test(a.phone)) err.phone = "Enter a valid 10-digit mobile number";
  if (a.line.trim().length < 5) err.line = "Please enter your full address";
  if (!/^[1-9]\d{5}$/.test(a.pincode)) err.pincode = "Enter a valid 6-digit pincode";
  if (a.city.trim().length < 2) err.city = "Please enter your city";
  if (a.state.trim().length < 2) err.state = "Please enter your state";
  return err;
};

/** /store/checkout — step 2: delivery address (remembered on this device), then on to payment. */
export function CheckoutAddress() {
  return (
    <div className="mx-auto max-w-5xl">
      <CheckoutSteps current={1} />
      <WithCart>
        {(cart) => (
          <div className="mt-8 grid grid-cols-1 gap-6 motion-safe:animate-[banner-in_0.4s_ease-out] lg:grid-cols-[1fr_380px]">
            <AddressForm />
            <OrderSummary cart={cart}>
              <Button type="submit" form="address-form" variant="gold" size="lg" className="mt-5 hidden w-full lg:inline-flex">
                Continue to payment
              </Button>
            </OrderSummary>
          </div>
        )}
      </WithCart>
    </div>
  );
}

function AddressForm() {
  const router = useRouter();
  const saved = useCheckout().address;
  const [form, setForm] = useState(saved || Object.fromEntries(FIELDS.map((f) => [f.k, ""])));
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const err = validate(form);
    setErrors(err);
    if (Object.keys(err).length) return;
    checkout.saveAddress(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])));
    router.push(routes.storePayment);
  };

  return (
    <form id="address-form" onSubmit={submit} noValidate className="rounded-3xl border border-line bg-surface p-6">
      <LocaleLink href={routes.store} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> Continue shopping
      </LocaleLink>
      <h1 className="mt-3 flex items-center gap-2 font-display text-2xl sm:text-3xl">
        <MapPin className="size-6 text-brand-600 dark:text-gold-400" aria-hidden /> Delivery address
      </h1>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map(({ k, label, wide, ...input }) => (
          <Field key={k} label={label} htmlFor={`addr-${k}`} error={errors[k]} className={wide ? "sm:col-span-2" : undefined}>
            <Input
              id={`addr-${k}`}
              value={form[k]}
              onChange={(e) => setForm((f) => ({ ...f, [k]: input.inputMode ? e.target.value.replace(/\D/g, "") : e.target.value }))}
              aria-invalid={Boolean(errors[k])}
              {...input}
            />
          </Field>
        ))}
      </div>
      <Button type="submit" variant="gold" size="lg" className="mt-6 w-full lg:hidden">
        Continue to payment
      </Button>
    </form>
  );
}
