export const STATUSES = [
  {value: "open", label: "Open"},
  {value: "under investigation", label: "Under Investigation"},
  {value: "case settled", label: "Case Settled"},
  {value: "lupon", label: "Lupon"},
  {value: "direct filing", label: "Direct Filing"},
  {value: "for record", label: "For Record"},
  {value: "turn-over", label: "Turn-Over"}
] as const;

export const BARANGAY_OPTIONS = [
  {id: 1, value:"Poblacion"},
  {id: 2, value:"Tunasan"},
  {id: 3, value:"Putatan"},
  {id: 4, value:"Bayanan"},
  {id: 5, value:"Alabang"},
  {id: 6, value:"Ayala Alabang"},
  {id: 7, value:"Buli"},
  {id: 8, value:"Cupang"},
  {id: 9, value:"Sucat"}
] as const;

export const BARANGAY_OPTIONS_WITH_ALL = [
  {id: 0, value:"All barangays"},
  {id: 1, value:"Poblacion"},
  {id: 2, value:"Tunasan"},
  {id: 3, value:"Putatan"},
  {id: 4, value:"Bayanan"},
  {id: 5, value:"Alabang"},
  {id: 6, value:"Ayala Alabang"},
  {id: 7, value:"Buli"},
  {id: 8, value:"Cupang"},
  {id: 9, value:"Sucat"}
] as const;

export const dateInterval = [
  {
    label: "Last 7 days",
    value: "last_7_days",
  },
  {
    label: "Last 30 days",
    value: "last_30_days",
  },
  {
    label: "This month",
    value: "this_month",
  },
  {
    label: "Last month",
    value: "last_month",
  },
  {
    label: "Custom",
    value: "custom",
  },
];
