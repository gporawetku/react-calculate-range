import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

// lib
const calcFuelPriceTable = ({ fuelRange }: { fuelRange: any }) => {
  const { min, max, range } = fuelRange;
  const data = [];

  let start = min;
  let count = 0;

  if (range > 0) {
    while (start < max && count < 15) {
      const end = Math.min(start + range, max);
      data.push({
        start: start.toFixed(2),
        end: end.toFixed(2),
        range: start.toFixed(2) + " - " + end.toFixed(2),
      });
      start += range;
      count++;
    }
  }

  return { data };
};
const calcFuelPriceData = ({ fuelPrice, fuelPriceTable }: any) => {
  const data = fuelPrice.map((fuel: any, idx: any) => {
    const { interval, price } = fuel;
    let amount = 0;

    const data = fuelPriceTable.map((item: any, idx: any) => {
      if (idx === 0) {
        amount = price[idx].amount || 0;
      } else {
        amount += interval || 0;
      }

      return {
        range: item.range,
        amount,
      };
    });

    return {
      ...fuel,
      price: data,
    };
  });
  return { data };
};
const createFuelTable = async ({ fuelPrice, fuelRange }: any) => {
  const { data: fuelPriceTable } = await calcFuelPriceTable({ fuelRange });
  const { data: fuelPriceData } = await calcFuelPriceData({
    fuelPrice,
    fuelPriceTable,
  });
  return { fuelPriceData };
};

const quotationDefaultValues = {
  header: {
    fuelRange: {
      min: 0,
      max: 1,
      range: 0.5,
    },
  },
  priceList: [
    {
      interval: 0,
      price: [
        {
          range: "0.00 - 0.50",
          amount: 0,
        },
        {
          range: "0.50 - 1.00",
          amount: 0,
        },
      ],
    },
  ],
};

// component
const QuotationHeader = () => {
  const methods = useFormContext();
  const { register, watch, setValue } = methods;

  return (
    <>
      <div className="grid grid-cols-12 gap-2">
        <TextField
          id="header.fuelRange.min"
          className="col-span-4"
          label="Min"
          type="number"
          size="small"
          inputProps={{
            step: "0.01",
          }}
          {...register("header.fuelRange.min", {
            valueAsNumber: true,
            onBlur(event) {
              let min = watch("header.fuelRange.min");
              const max = watch("header.fuelRange.max");
              const range = (max - min) / 15;

              setValue("header.fuelRange.range", range);

              if (min >= max) {
                setValue("header.fuelRange.min", max);
              }
            },
          })}
        />
        <TextField
          id="header.fuelRange.max"
          className="col-span-4"
          label="Max"
          type="number"
          size="small"
          inputProps={{
            step: "0.01",
          }}
          {...register("header.fuelRange.max", {
            valueAsNumber: true,
            onBlur(event) {
              const min = watch("header.fuelRange.min");
              const max = watch("header.fuelRange.max");
              const range = (max - min) / 15;

              setValue("header.fuelRange.range", range);
            },
          })}
        />
        <TextField
          id="header.fuelRange.range"
          className="col-span-4"
          label="Range"
          type="number"
          size="small"
          inputProps={{
            step: "0.01",
          }}
          {...register("header.fuelRange.range", {
            valueAsNumber: true,
            onBlur(event) {
              const min = watch("header.fuelRange.min");
              const max = watch("header.fuelRange.max");
              const range = (max - min) / 15;

              if (watch("header.fuelRange.range") < range) {
                setValue("header.fuelRange.range", range);
              }
              if (watch("header.fuelRange.range") >= max) {
                setValue("header.fuelRange.range", max - range);
              }
            },
          })}
        />
      </div>
    </>
  );
};
const QuotationTable = () => {
  const methods = useFormContext();
  const { watch, register, setValue } = methods;

  const watchFuelRange = watch("header.fuelRange");
  const watchFuelPrice = watch("priceList");

  return (
    <>
      <div>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Interval</TableCell>
                {watchFuelPrice[0].price.map((item: any, idx: any) => (
                  <TableCell key={idx} className="text-nowrap">
                    {item.range}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {watchFuelPrice.map((item: any, idx: any) => (
                <TableRow
                  key={idx}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <TextField
                      id={`priceList.${idx}.interval`}
                      type="number"
                      size="small"
                      {...register(`priceList.${idx}.interval`, {
                        valueAsNumber: true,
                        onChange: async (event) => {
                          const { fuelPriceData } = await createFuelTable({
                            fuelPrice: watchFuelPrice,
                            fuelRange: watchFuelRange,
                          });
                          setValue("priceList", fuelPriceData);
                        },
                      })}
                    />
                  </TableCell>
                  {item.price.map((item: any, pidx: any) => (
                    <TableCell key={pidx} align="right">
                      {pidx === 0 ? (
                        <TextField
                          id={`priceList.${idx}.price.${0}.amount`}
                          type="number"
                          size="small"
                          {...register(`priceList.${idx}.price.${0}.amount`, {
                            valueAsNumber: true,
                            onChange: async (event) => {
                              const { fuelPriceData } = await createFuelTable({
                                fuelPrice: watchFuelPrice,
                                fuelRange: watchFuelRange,
                              });
                              setValue("priceList", fuelPriceData);
                            },
                          })}
                        />
                      ) : (
                        item.amount
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

const QuotationForm = ({
  initialData,
  setFinalData,
}: {
  initialData?: any;
  setFinalData: any;
}) => {
  const methods = useForm({
    defaultValues: quotationDefaultValues,
    // values: initialData,
  });
  const { handleSubmit, watch, setValue } = methods;

  const [showTable, setShowTable] = useState(false);
  const onOpenTable = () => setShowTable(true);
  const onCloseTable = () => setShowTable(false);

  const watchFuelRange = watch("header.fuelRange");
  const watchFuelPrice = watch("priceList");

  useEffect(() => {
    onCloseTable();
  }, [watchFuelRange.min, watchFuelRange.max, watchFuelRange.range]);

  const onCreateFuelTable = async ({ fuelPrice, fuelRange }: any) => {
    const { fuelPriceData } = await createFuelTable({ fuelPrice, fuelRange });
    setValue("priceList", fuelPriceData);
    onOpenTable();
  };

  const onSubmit = (data: any) => {
    setFinalData(data);
    // console.log(data);
  };

  return (
    <>
      <div className="flex w-full justify-center">
        <FormProvider {...{ ...methods }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <QuotationHeader />
              <Button
                type="button"
                variant="contained"
                onClick={() =>
                  onCreateFuelTable({
                    fuelPrice: watchFuelPrice,
                    fuelRange: watchFuelRange,
                  })
                }
              >
                Submit Header
              </Button>
              {showTable && (
                <>
                  <QuotationTable />
                  <Button type="submit" variant="contained">
                    submit form
                  </Button>
                </>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  );
};

const Quotation = () => {
  const initQuotation: any = {
    header: {
      fuelRange: {
        min: 0,
        max: 50,
        range: 10,
      },
    },
    priceList: [
      {
        id: 1,
        interval: 500,
        price: [
          {
            range: "0.00 - 10.00",
            amount: 200,
          },
          {
            range: "10.00 - 20.00",
            amount: 300,
          },
          {
            range: "20.00 - 30.00",
            amount: 400,
          },
          {
            range: "30.00 - 40.00",
            amount: 500,
          },
          {
            range: "40.00 - 50.00",
            amount: 600,
          },
        ],
      },
      {
        id: 2,
        interval: 500,
        price: [
          {
            range: "0.00 - 10.00",
            amount: 200,
          },
          {
            range: "10.00 - 20.00",
            amount: 300,
          },
          {
            range: "20.00 - 30.00",
            amount: 400,
          },
          {
            range: "30.00 - 40.00",
            amount: 500,
          },
          {
            range: "40.00 - 50.00",
            amount: 600,
          },
        ],
      },
    ],
  };

  const [finalData, setFinalData] = useState();

  return (
    <>
      <div className="my-12 flex w-full flex-col items-center gap-4">
        <div
          className="flex w-fit flex-col gap-4 rounded-md border bg-white px-10 py-20 shadow-lg"
          style={{ minWidth: "700px" }}
        >
          <QuotationForm
            initialData={initQuotation}
            setFinalData={setFinalData}
          />
          <hr />
          {finalData && <pre>{JSON.stringify(finalData, null, 2)}</pre>}
        </div>
      </div>
    </>
  );
};

export default Quotation;
