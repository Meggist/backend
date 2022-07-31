import cheap from './data/cheap-bay.json';
import mid from './data/midrange-palms.json';
import random from './data/random-hotel.json';
import { format } from 'date-fns'

export type Currency = 'EUR' | 'UAH' | 'USD';

type CurrencyPrices = {
    'EUR': number,
    'UAH': number,
    'USD': number
}

type CurrencyMap = {
    'EUR': CurrencyPrices,
    'UAH': CurrencyPrices,
    'USD': CurrencyPrices
}

interface ICurrencyConverter {
    convert(value: number, from: Currency, to: Currency): number;
    toEUR(value: number, currency: Currency): number;
    toUAH(value: number, currency: Currency): number;
    toUSD(value: number, currency: Currency): number;
}

const CurrencyRatesToUAH = {
    USD: 26.5,
    EUR: 29.9
}

export class Converter implements ICurrencyConverter{
    private cmap: CurrencyMap;

    constructor(usdToUah: number, eurToUah: number) {
        this.cmap = this.createCurrancyMap(usdToUah, eurToUah)
    }

    convert(value: number, from: Currency, to: Currency): number {
        return value * this.cmap[from][to];
    }

    toUAH(value: number, currency: Currency): number {
        return value * this.cmap[currency]['UAH'];
    }

    toUSD(value: number, currency: Currency): number {
        return value * this.cmap[currency]['USD'];
    }

    toEUR(value: number, currency: Currency): number {
        return value * this.cmap[currency]['EUR'];
    }

    private  createCurrancyMap(usdToUah: number, eurToUah: number): CurrencyMap {
        return {
            'EUR': {
                'EUR': 1,
                'UAH': eurToUah,
                'USD': eurToUah/usdToUah,
            },
            'UAH': {
                'EUR': 1/eurToUah,
                'UAH': 1,
                'USD': 1/usdToUah,
            },
            'USD': {
                'EUR': usdToUah/eurToUah,
                'UAH': usdToUah,
                'USD': 1,
            }
        }
    }
}

const converter = new Converter(CurrencyRatesToUAH.USD, CurrencyRatesToUAH.EUR)

function getRandomHotel(input: RandomHotelInput[]) {
    return input.map(({date, prices}: RandomHotelInput) => {
       return {
            [date]: {
                economy: converter.toUSD(prices.economy.value, prices.economy.currency),
                standard: converter.toUSD(prices.standard.value, prices.standard.currency),
                luxury: converter.toUSD(prices.luxury.value, prices.luxury.currency),
            }
        }
    });
}

function getMidPalms(input: MidPalmsInput) {
    const newArr: any[] = [];
   Object.keys(input).map((key) => {
        return [...new Map(input[key].map((item: any) => [item["date"], item])).values()]
            .map((item: any) => {
                const tempArr = {key, ...item};
                delete tempArr.currency;
                return tempArr;
            });
    }).flat(1).map((item:any) => {
        let index: number;
        if (!newArr.length) {
            index = -1;
        }
        index = newArr.findIndex((value: any) => Object.keys(value)[0] === item.date);
        if(index !== -1) {
            newArr[index][item.date][item.key] = item.price;
        } else {
            newArr.push({[item.date]: {
                    [item.key]: item.price
                }})
        }
    })

    return newArr
}

type MidPalmsInput = {
    [key: string]: MidPalmsInputPrice[]
}

interface MidPalmsInputPrice {
    date: string,
    value: number,
    currency: Currency
}

type RandomHotelInput = {
    date: string,
    prices: {
        economy: RandomHotelInputPrice,
        standard: RandomHotelInputPrice,
        luxury?: RandomHotelInputPrice,
    }
}

interface RandomHotelInputPrice {
    value: number,
    currency: Currency
}

enum TimeDuration {
    SECONDS_PER_MINUTE = 60,
    MILLISECONDS_PER_SECOND = 1000,
}

function getCheap(input: CheapInput){
    const values: CheapInputPrice[] = Object.values(input);
    return Object.keys(input).map((key: string, index: number) => {
        let date: Date = new Date(key);
        date = new Date(date.getTime() - date.getTimezoneOffset() * TimeDuration.SECONDS_PER_MINUTE * TimeDuration.MILLISECONDS_PER_SECOND)
        return {
            [format(date, 'yyyy-MM-d')]: {
                economy: values[index].economy.split(' ')[0],
                standard: Number(values[index].standard.split(' ')[0])
            }
        }
    })
}

type CheapInput = {
    [key: string]: CheapInputPrice;
}

interface CheapInputPrice {
    economy: string,
    standard: string
}

const randomHostel = getRandomHotel(random as RandomHotelInput[]);
const midPalms = getMidPalms(mid as unknown as MidPalmsInput);
const cheapBay = getCheap(cheap as CheapInput);

const datePicker = document.querySelector('input');
datePicker.value = '2020-06-09';

const select = document.querySelector('select');
const tbody = document.querySelector('tbody');

datePicker.addEventListener('change', renderTable);
select.addEventListener('change', renderTable);

function renderTable() {
    Array.from(tbody.rows).forEach((item: any) => {
        Array.from(item.cells).forEach((item: any, index: number)=> {
            if(index !== 0) {
                item.remove()
            }
        })
    })
    const hostels = [randomHostel, midPalms, cheapBay];
    const arr = hostels.map((item:[]) => {
        return Object.values(Object.values(item.find((value: any) => datePicker.value === Object.keys(value)[0]))[0]) || '';
    });
    arr.forEach((item: [], index: number) => {
        item.forEach((value => {
            const td = document.createElement('td');
            td.textContent = converter.convert(Number(value), 'USD', select.value as Currency).toFixed(2);
            tbody.rows[index].appendChild(td);
        }))
    })
}