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

// component
const MainHeader = () => {
  const methods = useFormContext();
  const { register } = methods;

  return (
    <>
      <label htmlFor="header.fuelRange.min">min</label>
      <input id="header.fuelRange.min" type="number" step="0.01" {...register("header.fuelRange.min", { valueAsNumber: true })} />
      <label htmlFor="header.fuelRange.max">max</label>
      <input id="header.fuelRange.max" type="number" step="0.01" {...register("header.fuelRange.max", { valueAsNumber: true })} />
      <label htmlFor="header.fuelRange.range">range</label>
      <input id="header.fuelRange.range" type="number" step="0.01" {...register("header.fuelRange.range", { valueAsNumber: true })} />
    </>
  );
};
const MainTable = () => {
  const methods = useFormContext();
  const { watch, register, setValue } = methods;
  const { createFuelTable }: any = methods;

  const watchFuelRange = watch("header.fuelRange");
  const watchFuelPrice = watch("priceList");

  return (
    <>
      <div className="">
        {watchFuelPrice.map((item: any, idx: any) => (
          <div key={idx}>
            <input
              id={`priceList.${idx}.interval`}
              type="number"
              step="0.01"
              {...register(`priceList.${idx}.interval`, {
                valueAsNumber: true,
                onChange: async (event) => {
                  const { fuelPriceData } = await createFuelTable({ fuelPrice: watchFuelPrice, fuelRange: watchFuelRange });
                  setValue("priceList", fuelPriceData);
                },
              })}
            />
            <hr />
            {item.price.map((item: any, pidx: any) => (
              <div key={pidx}>
                {pidx === 0 ? (
                  <>
                    {item.range} :
                    <input
                      id={`priceList.${idx}.price.${0}.amount`}
                      type="number"
                      step="0.01"
                      {...register(`priceList.${idx}.price.${0}.amount`, {
                        valueAsNumber: true,
                        onChange: async (event) => {
                          const { fuelPriceData } = await createFuelTable({ fuelPrice: watchFuelPrice, fuelRange: watchFuelRange });
                          setValue("priceList", fuelPriceData);
                        },
                      })}
                    />
                  </>
                ) : (
                  <>
                    {item.range} : {item.amount}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
const MainForm = ({ initialData }: { initialData?: any }) => {
  const methods = useForm({
    defaultValues: {
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
    },
    values: initialData,
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

  const createFuelTable = async ({ fuelPrice, fuelRange }: any) => {
    const { data: fuelPriceTable } = await calcFuelPriceTable({ fuelRange });
    const { data: fuelPriceData } = await calcFuelPriceData({ fuelPrice, fuelPriceTable });
    return { fuelPriceData };
  };

  const onCreateFuelTable = async ({ fuelPrice, fuelRange }: any) => {
    const { fuelPriceData } = await createFuelTable({ fuelPrice, fuelRange });
    setValue("priceList", fuelPriceData);
    onOpenTable();
  };

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <>
      <FormProvider {...{ ...methods, createFuelTable }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <MainHeader />
          <button type="button" onClick={() => onCreateFuelTable({ fuelPrice: watchFuelPrice, fuelRange: watchFuelRange })}>
            Submit Header
          </button>
          {showTable && (
            <>
              <MainTable />
              <button type="submit">submit form</button>
            </>
          )}
        </form>
      </FormProvider>
    </>
  );
};

// Main
function App() {
  const initialData: any = {
    header: {
      fuelRange: {
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
