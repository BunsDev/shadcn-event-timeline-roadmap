export type Events = {
  year: number;
  periodType: string;
  periodNumber: number;
  isChecked: boolean;
  events: {
    title: string;
    isChecked: boolean;
  }[];
}[];
