"use client";
// import { toast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button";

import Models from "@/imports/models.import";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetState } from "@/utils/function.utils";
import { DatePicker } from "@/components/common-components/datePicker";
import CustomSelect from "@/components/common-components/dropdown";
import { TextInput } from "@/components/common-components/textInput";
import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { useEffect } from "react";
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";

export default function UpdateCoupon() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [state, setState] = useSetState({
    code: "",
    discount_type: null,
    discount_value: "",
    valid_from: null,
    valid_to: null,
    errors: {},
    submitLoading: false,
  });

  useEffect(() => {
    getDetails();
  }, [id]);

  const getDetails = async () => {
    try {
      const res = await Models.coupon.details(id);
      setState({
        code: res.code,
        discount_type: { value: res.discount_type, label: res.discount_type },
        discount_value: res.discount_value.toString(),
        valid_from: res.valid_from ? new Date(res.valid_from) : null,
        valid_to: res.valid_to ? new Date(res.valid_to) : null,
      });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });
      const body = {
        code: state?.code,
        discount_type: state?.discount_type?.value,
        discount_value: state?.discount_value,
        valid_from: state?.valid_from,
        valid_to: state?.valid_to,
      };

      await Validation.createCoupon.validate(body, {
        abortEarly: false,
      });
      await Models.coupon.update(body, id);
      setState({ submitLoading: false });

      router.push("/coupon-list");
      Success("Coupon updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        setState({ errors: validationErrors });
        setState({ submitLoading: false });
      } else {
        setState({ submitLoading: false });
      }
    }
  };

  const options = [
    { value: "fixed", label: "Fixed" },
    { value: "percentage", label: "Percentage" },
  ];

  return (
    <div className="container mx-auto">
      <div className="font-bold text-lg mb-3">Update Coupon</div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        <TextInput
          value={state.code}
          onChange={(e) => {
            setState({ code: e.target.value });
          }}
          placeholder="Code"
          title="Code"
          error={state.errors?.code}
        />

        <CustomSelect
          options={options}
          value={state.discount_type?.value || ""}
          onChange={(value) => setState({ discount_type: value })}
          title="Coupon Type"
          error={state.errors?.discount_type}
        />

        <TextInput
          value={state.discount_value}
          onChange={(e) => {
            setState({ discount_value: e.target.value });
          }}
          placeholder="Value"
          title="Value"
          error={state.errors?.discount_value}
        />

        <div className="grid auto-rows-min gap-4 grid-cols-2">
          <DatePicker
            placeholder="Start date"
            title="Start date"
            selectedDate={state.valid_from}
            onChange={(date) => {
              console.log("date: ", date);
              setState({
                valid_from: date,
              });
            }}
            error={state.errors?.valid_from}
          />
          <DatePicker
            placeholder="End date"
            title="End date"
            selectedDate={state.valid_to}
            onChange={(date) =>
              setState({
                valid_to: date,
              })
            }
            error={state.errors?.valid_to}
          />
        </div>

        <div className="flex justify-end gap-5">
          <PrimaryButton
            variant={"outline"}
            name="Cancel"
            onClick={() => router.push("/coupon-list")}
          />

          <PrimaryButton
            name="Submit"
            onClick={() => onSubmit()}
            loading={state.submitLoading}
          />
        </div>
      </div>
    </div>
  );
}
