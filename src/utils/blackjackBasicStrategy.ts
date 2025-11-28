// blackjackBasicStrategy.ts

export type DealerUpcard =
  "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "A";

// Added | "" to allow for empty cells in Late Surrender
export type Action =
  "Y" | "N" | "Y_N" | "H" | "S" | "D" | "Ds" | "SUR" | "";

export interface PairSplittingTable {
  [pair: string]: Action[];
}

export interface SoftTotalsTable {
  [hand: string]: Action[];
}

export interface HardTotalsTable {
  [total: number]: Action[];
}

export interface LateSurrenderTable {
  [total: number]: Action[];
}

export interface BasicStrategy {
  dealerUpcards: DealerUpcard[];
  pairSplitting: PairSplittingTable;
  softTotals: SoftTotalsTable;
  hardTotals: HardTotalsTable;
  lateSurrender: LateSurrenderTable;
  insuranceRule: string;
}

export const basicStrategy: BasicStrategy = {
  dealerUpcards: ["2","3","4","5","6","7","8","9","10","A"],

  pairSplitting: {
    "A,A": ["Y","Y","Y","Y","Y","Y","Y","Y","Y","Y"],
    "T,T": ["N","N","N","N","N","N","N","N","N","N"],
    "9,9": ["Y","Y","Y","Y","Y","N","Y","Y","N","N"],
    "8,8": ["Y","Y","Y","Y","Y","Y","Y","Y","Y","Y"],
    "7,7": ["Y","Y","Y","Y","Y","Y","N","N","N","N"],
    "6,6": ["Y_N","Y","Y","Y","Y","N","N","N","N","N"],
    "5,5": ["N","N","N","N","N","N","N","N","N","N"],
    "4,4": ["N","N","N","Y_N","Y_N","N","N","N","N","N"],
    "3,3": ["Y_N","Y_N","Y","Y","Y","Y","N","N","N","N"],
    "2,2": ["Y_N","Y_N","Y","Y","Y","Y","N","N","N","N"]
  },

  softTotals: {
    "A,9": ["S","S","S","S","S","S","S","S","S","S"],
    "A,8": ["S","S","S","S","Ds","S","S","S","S","S"],
    "A,7": ["Ds","Ds","Ds","Ds","Ds","S","S","H","H","H"],
    "A,6": ["H","D","D","D","D","H","H","H","H","H"],
    "A,5": ["H","H","D","D","D","H","H","H","H","H"],
    "A,4": ["H","H","D","D","D","H","H","H","H","H"],
    "A,3": ["H","H","H","D","D","H","H","H","H","H"],
    "A,2": ["H","H","H","D","D","H","H","H","H","H"]
  },

  hardTotals: {
    17: ["S","S","S","S","S","S","S","S","S","S"],
    16: ["S","S","S","S","S","H","H","H","H","H"],
    15: ["S","S","S","S","S","H","H","H","H","H"],
    14: ["S","S","S","S","S","H","H","H","H","H"],
    13: ["S","S","S","S","S","H","H","H","H","H"],
    12: ["H","H","S","S","S","H","H","H","H","H"],
    11: ["D","D","D","D","D","D","D","D","D","D"],
    10: ["D","D","D","D","D","D","D","D","H","H"],
    9:  ["H","D","D","D","D","H","H","H","H","H"],
    8:  ["H","H","H","H","H","H","H","H","H","H"]
  },

  lateSurrender: {
    16: ["","","","","","","","SUR","SUR","SUR"],
    15: ["","","","","","","","","SUR",""],
    14: ["","","","","","","","","",""]
  },

  insuranceRule: "Do not take insurance or even money."
};
