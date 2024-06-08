import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";

// Zod
const PriceSchema = z.object({
  range: z.string(),
  amount: z.number(),
});
const PriceListSchema = z.object({
  interval: z.number(),
  price: z.array(PriceSchema),
});
const FuelPriceSchema = z.object({
  min: z.number(),
  max: z.number(),
  range: z.number(),
});
const QuotationSchema = z.object({
  header: z.object({
    fuelPrice: FuelPriceSchema,
  }),
  priceList: z.array(PriceListSchema),
});

// Type
type TQuotation = z.infer<typeof QuotationSchema>;
type TPriceList = z.infer<typeof PriceListSchema>;
type TFuelPrice = z.infer<typeof FuelPriceSchema>;

// lib
const getFuelRange = ({ fuelPrice }: { fuelPrice: TFuelPrice }) => {
  const { min, max, range } = fuelPrice;
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

  return { data, count };
};
const calcFuelPrice = ({ interval, prices, firstPrice }: any) => {
  let amount = 0;
  const data = prices.map((item: any, idx: any) => {
    if (idx === 0) {
      amount = firstPrice.amount || 0;
    } else {
      amount += interval || 0;
    }
    return {
      ...item,
      amount,
    };
  });
  return data;
};

// Form
const MainHead = () => {
  const methods = useFormContext();
  const { register, watch, setValue } = methods;
  const {
    state: { fuelRangeTable, setFuelRangeTable, setFuelRangeShow },
  }: any = methods;

  const watchFuelPrice = watch("header.fuelPrice");
  const watchPriceList = watch("priceList");

  // useEffect(() => {
  //   const fuelPriceRange = getFuelRange({ fuelPrice: watchFuelPrice });
  //   setFuelRangeTable(fuelPriceRange);
  // }, [watchFuelPrice, watchFuelPrice.min, watchFuelPrice.max, watchFuelPrice.range, setFuelRangeTable, setFuelRangeShow]);

  const onCreateFuelPrice = async () => {
    await watchPriceList.map((price: any, pidx: any) => {
      const fuelPrices = fuelRangeTable?.data?.map((fuelPrice: any, idx: any) => {
        return {
          range: fuelPrice.range,
          amount: 0,
        };
      });
      setValue(`priceList.${pidx}.price`, fuelPrices);
    });
    setFuelRangeShow(true);
  };

  return (
    <div className="">
      <div className="">
        <label htmlFor="header.fuelPrice.min">min</label>
        <input
          id="header.fuelPrice.min"
          type="number"
          step="any"
          {...register("header.fuelPrice.min", {
            valueAsNumber: true,
            onBlur(event) {
              const min = watch("header.fuelPrice.min");
              const max = watch("header.fuelPrice.max");
              const range = (max - min) / 15;

              setValue("header.fuelPrice.range", range);

              if (min > max) {
                setValue("header.fuelPrice.min", max);
              }
            },
          })}
        />
      </div>
      <div className="">
        <label htmlFor="header.fuelPrice.max">max</label>
        <input
          id="header.fuelPrice.max"
          type="number"
          step="any"
          {...register("header.fuelPrice.max", {
            valueAsNumber: true,
            onBlur(event) {
              const min = watch("header.fuelPrice.min");
              const max = watch("header.fuelPrice.max");
              const range = (max - min) / 15;

              setValue("header.fuelPrice.range", range);
            },
          })}
        />
      </div>
      <div className="">
        <label htmlFor="header.fuelPrice.range">range</label>
        <input
          id="header.fuelPrice.range"
          type="number"
          step="any"
          {...register("header.fuelPrice.range", {
            valueAsNumber: true,
            onBlur(event) {
              const min = watch("header.fuelPrice.min");
              const max = watch("header.fuelPrice.max");
              const range = (max - min) / 15;

              if (watch("header.fuelPrice.range") < range) {
                setValue("header.fuelPrice.range", range);
              }
              if (watch("header.fuelPrice.range") > max) {
                setValue("header.fuelPrice.range", max);
              }
            },
          })}
        />
      </div>
      <button type="button" onClick={onCreateFuelPrice}>
        submit form
      </button>
    </div>
  );
};
const MainTable = () => {
  const methods = useFormContext();
  const { watch, register, setValue } = methods;
  const {
    priceList,
    state: { fuelRangeTable },
  }: any = methods;

  const watchPriceList = watch("priceList");

  const onChangePrice = (options: any) => {
    const interval = parseFloat(watch(`priceList.${options.rowIndex}.interval`));
    const prices = watch(`priceList.${options.rowIndex}.price`);
    const firstPrice = watch(`priceList.${options.rowIndex}.price.${0}`);
    const fuelPrice = calcFuelPrice({ interval, prices, firstPrice });
    setValue(`priceList.${options.rowIndex}.price`, fuelPrice);
  };

  const IntervalEditor = (rowData: any, options: any) => {
    return (
      <>
        <input
          id={`priceList.${options.rowIndex}.interval`}
          type="number"
          {...register(`priceList.${options.rowIndex}.interval`, {
            valueAsNumber: true,
            onChange(event) {
              onChangePrice(options);
            },
          })}
        />
      </>
    );
  };
  const PriceEditor = (rowData: any, options: any) => {
    return (
      <>
        <input
          id={`priceList.${options.rowIndex}.price.${0}.amount`}
          type="number"
          {...register(`priceList.${options.rowIndex}.price.${0}.amount`, {
            valueAsNumber: true,
            onChange(event) {
              onChangePrice(options);
            },
          })}
        />
      </>
    );
  };

  return (
    <>
      <table>
        <thead>
          <tr>
            <th rowSpan={2}>ช่วงราคา</th>
            <th colSpan={fuelRangeTable?.count}>อัตราราคาน้ำมัน บาท/ลิตร</th>
          </tr>
          <tr>
            {fuelRangeTable?.data?.map((item: any, idx: any) => (
              <th key={idx} className="text-center">
                {item.range}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {priceList.fields.map((field: TPriceList, idx: number) => (
            <tr key={idx}>
              <td>{IntervalEditor(field, { rowIndex: idx })}</td>
              {watchPriceList[idx]?.price?.map((item: any, idx: any) => (
                <td key={idx}>{idx > 0 ? item.amount : PriceEditor(field, { rowIndex: idx })}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
const MainForm = ({ initialData }: { initialData?: any }) => {
  const methods = useForm({
    resolver: zodResolver(QuotationSchema),
    defaultValues: {
      header: {
        fuelPrice: {
          min: 0,
          max: 10,
          range: 5,
        },
      },
      priceList: [
        {
          interval: 100,
          price: [
            {
              range: "",
              amount: 0,
            },
          ],
        },
      ],
    },
    values: initialData,
  });

  const { handleSubmit, control } = methods;
  const priceList = useFieldArray({
    control,
    name: "priceList",
  });

  const [fuelRangeTable, setFuelRangeTable] = useState();
  const [fuelRangeShow, setFuelRangeShow] = useState(true);

  const onSubmit = (data: TQuotation) => {
    console.log(data);
  };

  return (
    <FormProvider {...{ ...methods, priceList, state: { fuelRangeTable, setFuelRangeTable, fuelRangeShow, setFuelRangeShow } }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <MainHead />
        {fuelRangeShow && (
          <>
            <MainTable />
            <button type="submit">submit</button>
          </>
        )}
      </form>
    </FormProvider>
  );
};

// Main
function App() {
  const initialData: TQuotation = {
    header: {
      fuelPrice: {
        min: 0,
        max: 50,
        range: 10,
      },
    },
    priceList: [
      {
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

  return (
    <div>
      <MainForm initialData={initialData} />
    </div>
  );
}

export default App;
