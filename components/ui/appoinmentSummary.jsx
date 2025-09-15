import React from "react";
import { Trash2 } from "lucide-react";
import { objIsEmpty, timeFormat } from "@/utils/function.utils";
import moment from "moment";

export default function AppoinmentSummary(props) {
  const {
    lines,
    couponAmount,
    total,
    selectedRecord,
    removeCoupon,
    selectedDate,
    seletedSlot,
  } = props;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-semibold text-lg mb-2">Appointment Summary</h3>
      <div className="space-y-3 mb-4 border-b p-1">
        <div className="flex justify-between text-sm ">
          {selectedDate && (
            <span>
              <span className="font-bold">Date :</span>{" "}
              {moment(selectedDate).format("YYYY-MM-DD")}
            </span>
          )}
          {seletedSlot && (
            <span>
              <span className="font-bold">Slot :</span>{" "}
              {timeFormat(seletedSlot?.start_time)}
            </span>
          )}
        </div>
      </div>
      {objIsEmpty(selectedRecord) ? (
        <p className="text-gray-500 text-sm">No services selected yet</p>
      ) : (
        <div>
          <div className="space-y-3 mb-3 ">
            <div
              key={selectedRecord?.id}
              className="flex justify-between text-sm"
            >
              <span>{selectedRecord?.title}</span>
              <span className="font-medium">
                ₹{selectedRecord?.price ? parseInt(selectedRecord?.price) : 0}
              </span>
            </div>
          </div>
          {couponAmount > 0 && (
            <div
              key={couponAmount}
              className="flex justify-between text-sm text-green-600 mb-4"
            >
              <span>{"Coupon Amount"}</span>
              <div className="flex items-center">
                <Trash2
                  size={14}
                  className="inline cursor-pointer mr-2 text-red-500"
                  onClick={() => removeCoupon()}
                />
                <span className="font-medium">- ₹{couponAmount}</span>
              </div>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
