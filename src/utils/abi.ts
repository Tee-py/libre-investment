export const FundTokenABI = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "investor",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "usdAmount",
          type: "uint256",
        },
      ],
      name: "invest",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "investor",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "shares",
          type: "uint256",
        },
      ],
      name: "redeem",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getFundMetrics",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "totalAssetValue",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "sharesSupply",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lastUpdateTime",
              type: "uint256",
            },
          ],
          internalType: "struct FundToken.FundMetrics",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getSharePrice",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ] as const;
  
  export interface FundMetrics {
    totalAssetValue: bigint;
    sharesSupply: bigint;
    lastUpdateTime: bigint;
  }