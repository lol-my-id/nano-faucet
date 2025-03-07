"use client"
import React, { useState } from "react";

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { validateNanoAddress } from "../modules/utils";
import { cToast } from "./Toast";

import { useAtom } from 'jotai';
import { addressAtom } from '../contexts/Provider';

interface NanoAddressModalProps {
  setVisible: (visible: boolean) => void;
}

const NanoAddressModal: React.FC<NanoAddressModalProps> = ({ setVisible }) => {
    const [tempAddress, setTempAddress] = useState("");
    const [, setAddress] = useAtom(addressAtom);

  const handleSave = () => {
    const isValid = validateNanoAddress(tempAddress);
    
    if(!isValid) {
        cToast.error("Invalid NANO Address");
        return;
    }

    setAddress(tempAddress);
    setVisible(false);

    cToast.success("NANO Address saved successfully");
  };

  return (
    <div
      className="modal modal-open z-[9999]"
      onClick={() => setVisible(false)} // Close modal when clicking outside
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Set your NANO Address</h3>
        </div>

        {/* Content */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter your NANO Address"
            value={tempAddress}
            onChange={(e) => setTempAddress(e.target.value)}
            className="input input-bordered w-full"
        />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <button className="btn btn-primary" onClick={handleSave}>
            <SaveIcon className="mr-2" />
            Save
          </button>
          <button className="btn" onClick={()=>setVisible(false)}>
            <CancelIcon className="mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NanoAddressModal;