export const getUnitStatusStyle = (status: string) => {
  switch (status) {
    case "vacant":
      return "bg-green-500";
    case "occupied":
      return "bg-red-500";
    case "maintenance":
      return "bg-yellow-500";
  }
};
