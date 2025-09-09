import '@core/declarations'
import { Request, Response, NextFunction } from 'express'
import * as fs from 'fs'
import ejs from 'ejs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { IAxiosConfig } from 'interfaces'
import constant from './constants'
import Web3 from 'web3'

export const FileExistsSync = (FilePath: string) => {
        return fs.existsSync(`${FilePath}.js`) || fs.existsSync(`${FilePath}.ts`)
}

export function Wrap(controller: CallableFunction) {
        
        return async (req: Request, res: Response, next: NextFunction) => {
                try {
                        await controller(req, res, next)
                } catch (error) {
                        Logger.error(error)
                        return (res as any).internalServerError({ error: error?.message })
                }
        }
}

export function GenerateCallableMessages(_Messages: any) {
        const Messages = {}

        ;(function _GenerateCallableMessages(target, values: any) {
                try {
                        for (const key in values) {
                                if (typeof values[key] === 'string') {
                                        target[key] = (params: any) => {
                                                return ejs.render(values[key], params)
                                        }
                                } else {
                                        target[key] = {}
                                        _GenerateCallableMessages(target[key], values[key])
                                }
                        }
                } catch (error) {
                        Logger.error(error)
                }
        })(Messages, _Messages)

        return Messages
}

export function GenerateAuthToken(payload): string {
        const token = jwt.sign(payload, App.Config.JWT.SECRET, { expiresIn: App.Config.JWT.EXPIRY })
        return token
}

export function GenerateRandomString(length: number): string {
        const byteLength = Math.ceil(length / 2) // Each byte represents two characters in hexadecimal form.
        const randomBytes = crypto.randomBytes(byteLength)
        return randomBytes.toString('hex').slice(0, length)
}

export const axiosConfig = ({ url, method, data, headers }: IAxiosConfig) => {
        const obj = {
                url,
                method,
                ...(data ? { data } : {}),
                headers,
        }

        return obj
}

export function isObject(value: any) {
        return Object.prototype.toString.call(value) === '[object Object]'
}

export function ImageValidator(file: { mimetype: string; size: number }, language) {
        const { mimetype, size } = file
        const validMimetypes = constant.IMAGE.MIME_TYPES
        const validSizeInMb = constant.IMAGE.SIZE_IN_MB
        if (!validMimetypes.includes(mimetype)) {
                return {
                        isSuccess: false,
                        message: App.Message.Error.InvalidImageType({
                                allowedTypes: validMimetypes,
                        }),
                }
        }
        if (size / (1024 * 1024) > validSizeInMb) {
                return {
                        isSuccess: false,
                        message: App.Message.Error.InvalidImageSize({
                                allowedSizeInMb: validSizeInMb,
                        }),
                }
        }
        return {
                isSuccess: true,
        }
}

export function PdfValidator(file: { mimetype: string; size: number }, language) {
        const { mimetype, size } = file
        const validMimetypes = constant.PDF.MIME_TYPES
        const validSizeInMb = constant.PDF.SIZE_IN_MB
        if (!validMimetypes.includes(mimetype)) {
                return {
                        isSuccess: false,
                        message: App.Message.Error.InvalidDocumentType({
                                allowedTypes: validMimetypes,
                        }),
                }
        }
        if (size / (1024 * 1024) > validSizeInMb) {
                return {
                        isSuccess: false,
                        message: App.Message.Error.InvalidDocumentSize({
                                allowedSizeInMb: validSizeInMb,
                        }),
                }
        }
        return {
                isSuccess: true,
        }
}

export function PdfImageValidator(file: { mimetype: string; size: number }, language) {
        const { mimetype, size } = file
        const validMimetypes = constant.PDF_IMAGE.MIME_TYPES
        const validSizeInMb = constant.PDF_IMAGE.SIZE_IN_MB
        if (!validMimetypes.includes(mimetype)) {
                return {
                        isSuccess: false,
                        message: App.Message.Error.InvalidDocumentType({
                                allowedTypes: validMimetypes,
                        }),
                }
        }
        if (size / (1024 * 1024) > validSizeInMb) {
                return {
                        isSuccess: false,
                        message: App.Message.Error.InvalidDocumentSize({
                                allowedSizeInMb: validSizeInMb,
                        }),
                }
        }
        return {
                isSuccess: true,
        }
}

export function calculatePercentage(total: number, value: number) {
        return (value / total) * 100
}

export function calculateFee(feeInPercent: number, value: number) {
        return parseInt(((feeInPercent / 100) * value).toString())
}

export function weiToEther(value: number) {
        return Number(Web3.utils.fromWei(value, 'ether'))
}

export function decimalToMatic(value: number) {
        const decimalValue = parseInt('1' + '0'.repeat(constant.MATIC_DECIMALS))
        return parseInt((value * decimalValue).toString())
}

export function maticToDecimal(value: number) {
        const decimalValue = parseInt('1' + '0'.repeat(constant.MATIC_DECIMALS))
        return (value / decimalValue).toFixed(constant.MATIC_DECIMALS)
}

export function aggregateDataByFormat(
    arr: { x: string; y: number }[],
    formatType: string
): { x: string; y: number }[] {
    // Helper function to parse dates
    function parseDate(dateStr: string): Date {
        return new Date(dateStr);
    }

    // Helper function to get interval end
    function getIntervalEnd(date: Date, unit: string): Date {
        switch (unit) {
            case "1h": 
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1);
            case "1d": 
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            case "1w": 
                const dayOffset = 7 - date.getDay();
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset);
            case "1m": 
                return new Date(date.getFullYear(), date.getMonth() + 1, 1);
            case "6m": 
                const nextHalfYear = Math.floor(date.getMonth() / 6) * 6 + 6;
                return new Date(date.getFullYear(), nextHalfYear, 1);
            case "1y": 
                return new Date(date.getFullYear() + 1, 0, 1);
            case "YTD": 
                const today = new Date();
                return today.getFullYear() === date.getFullYear()
                    ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                    : new Date(date.getFullYear() + 1, 0, 1);
            case "5y":
                const next5Year = Math.floor(date.getFullYear() / 5) * 5 + 5;
                return new Date(next5Year, 0, 1);
            case "alltime": 
                return new Date(8640000000000000);
            default:
                throw new Error(`Invalid format type: ${unit}`);
        }
    }

    const unitMap: Record<string, string> = {
        "1d": "1h",
        "1w": "1d",
        "1m": "1d",
        "6m": "1m",
        "1y": "1m",
        "YTD": "1m",
        "5y": "1y",
        "all": "alltime",
    };

    if (!unitMap[formatType]) {
        throw new Error(`Invalid format type: ${formatType}`);
    }

    const timeUnit = unitMap[formatType];

    // Group data by intervals
    const groupedData: Record<string, { date: Date; y: number }[]> = {};

    arr.forEach(({ x, y }) => {
        const date = parseDate(x);
        const intervalEnd = getIntervalEnd(date, timeUnit).toISOString();

        if (!groupedData[intervalEnd]) {
            groupedData[intervalEnd] = [];
        }

        groupedData[intervalEnd].push({ date, y });
    });

    // Determine how many intervals should be created based on data length
    const numIntervals = arr.length >= 20 ? 10 : arr.length;

    // For each interval, find the closest data point
    const result: { x: string; y: number }[] = [];

    Object.entries(groupedData).forEach(([intervalEnd, values]) => {
        // Sort values in ascending order by date
        values.sort((a, b) => a.date.getTime() - b.date.getTime());

        // Determine the size of each segment
        const segmentSize = Math.ceil(values.length / numIntervals);

        for (let i = 0; i < values.length; i += segmentSize) {
            const segment = values.slice(i, i + segmentSize);
            
            // Find the closest value within the segment
            const intervalEndDate = parseDate(intervalEnd);
            const closestValue = segment.reduce((closest, current) => {
                const currentDiff = Math.abs(current.date.getTime() - intervalEndDate.getTime());
                const closestDiff = Math.abs(closest.date.getTime() - intervalEndDate.getTime());
                return currentDiff < closestDiff ? current : closest;
            });

            result.push({
                x: closestValue.date.toISOString(),
                y: closestValue.y,
            });
        }
    });

    return result;
}


