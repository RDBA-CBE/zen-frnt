"use client";

import Models from "@/imports/models.import";
import { useRouter, useSearchParams } from "next/navigation";
import { DatePicker } from "@/components/common-components/datePicker";
import CustomSelect from "@/components/common-components/dropdown";
import { TextInput } from "@/components/common-components/textInput";
import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import ProtectedRoute from "@/components/common-components/privateRouter";
import { useEffect, useState } from "react";

const UpdateCoupon = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);

  const [state, setState] = useState({
    code: "",
    discount_type: null,
    discount_value: "",
    valid_from: null,
    valid_to: null,
    errors: {},
    submitLoading: false,
  });

  // Read coupon ID from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      if (idFromSearchParams) setId(idFromSearchParams);
    }
  }, [searchParams]);

  // Fetch coupon details
  useEffect(() => {
    if (id) getDetails();
  }, [id]);

  const getDetails = async () => {
    try {
      const res = await Models.coupon.details(id);
      setState((prev) => ({
        ...prev,
        code: res.code || "",
        discount_type: res.discount_type
          ? { value: res.discount_type, label: res.discount_type }
          : null,
        discount_value:
          res.discount_value !== undefined && res.discount_value !== null
            ? res.discount_value.toString()
            : "",
        valid_from: res.valid_from ? new Date(res.valid_from) : null,
        valid_to: res.valid_to ? new Date(res.valid_to) : null,
      }));
    } catch (error) {
      console.log("Error fetching coupon details:", error);
    }
  };

  const onSubmit = async () => {
    try {
      setState((prev) => ({ ...prev, submitLoading: true }));

      const body = {
        code: state.code,
        discount_type: state.discount_type?.value,
        discount_value: state.discount_value,
        valid_from: state.valid_from,
        valid_to: state.valid_to,
      };

      await Validation.createCoupon.validate(body, { abortEarly: false });

      await Models.coupon.update(body, id);

      setState((prev) => ({ ...prev, submitLoading: false }));
      router.push("/coupon-list");
      Success("Coupon updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          if (err.path) validationErrors[err.path] = err.message;
        });

        setState((prev) => ({
          ...prev,
          errors: validationErrors,
          submitLoading: false,
        }));
      } else {
        console.log("Unexpected error:", error);
        setState((prev) => ({ ...prev, submitLoading: false }));
      }
    }
  };

  const options = [
    { value: "fixed", label: "Fixed" },
    { value: "percentage", label: "Percentage" },
  ];

  return (
    <div className="container lg:w-[800px] w-full mx-auto">
      <div className="font-bold text-lg mb-3">Update Coupon</div>

      <div className="border rounded-lg p-4 grid auto-rows-min gap-4 md:grid-cols-1">
        <TextInput
          value={state.code}
          onChange={(e) =>
            setState((prev) => ({ ...prev, code: e.target.value }))
          }
          placeholder="Code"
          title="Code"
          error={state.errors?.code}
          required
        />

        <CustomSelect
          options={options}
          value={state.discount_type?.value || ""}
          onChange={(value) =>
            setState((prev) => ({ ...prev, discount_type: value }))
          }
          title="Coupon Type"
          error={state.errors?.discount_type}
          required
        />

        <TextInput
          value={state.discount_value}
          onChange={(e) =>
            setState((prev) => ({ ...prev, discount_value: e.target.value }))
          }
          placeholder="Value"
          title="Value"
          error={state.errors?.discount_value}
          required
        />

        <div className="grid auto-rows-min gap-4 grid-cols-2">
          <DatePicker
            placeholder="Start date"
            title="Start date"
            selectedDate={state.valid_from}
            onChange={(date) =>
              setState((prev) => ({ ...prev, valid_from: date }))
            }
            error={state.errors?.valid_from}
            required
            disablePastDates

          />
          <DatePicker
            placeholder="End date"
            title="End date"
            selectedDate={state.valid_to}
            onChange={(date) =>
              setState((prev) => ({ ...prev, valid_to: date }))
            }
            error={state.errors?.valid_to}
            required
            disablePastDates

          />
        </div>

        <div className="flex justify-end gap-5">
          <PrimaryButton
            variant="outline"
            className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen"
            name="Cancel"
            onClick={() => router.push("/coupon-list")}
          />
          <PrimaryButton
            name="Submit"
            onClick={onSubmit}
            className="bg-themeGreen hover:bg-themeGreen"
            loading={state.submitLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute(UpdateCoupon);
