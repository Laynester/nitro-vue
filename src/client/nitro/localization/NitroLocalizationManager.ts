﻿import { NitroManager } from '../../core/common/NitroManager';
import { Nitro } from '../Nitro';
import { BadgeBaseAndLevel } from './BadgeBaseAndLevel';
import { INitroLocalizationManager } from './INitroLocalizationManager';
import { NitroLocalizationEvent } from './NitroLocalizationEvent';

export class NitroLocalizationManager extends NitroManager implements INitroLocalizationManager
{
    private _definitions: Map<string, string>;
    private _parameters: Map<string, Map<string, string>>;
    private _romanNumerals: string[];

    constructor()
    {
        super();

        this._definitions   = new Map();
        this._parameters    = new Map();
        this._romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'];
    }

    protected onInit(): void
    {
        this.loadLocalizationFromURL(Nitro.instance.getConfiguration<string>('external.texts.url'));
    }

    public loadLocalizationFromURL(url: string): void
    {
        const request = new XMLHttpRequest();

        try
        {
            request.open('GET', url);

            request.onloadend   = this.onLocalizationLoaded.bind(this);
            request.onerror     = this.onLocalizationFailed.bind(this);

            request.send();
        }

        catch (e)
        {
            this.logger.error(e);
        }
    }

    private onLocalizationLoaded(event: ProgressEvent<EventTarget>): void
    {
        if(!event) return;

        const target = (event.target as XMLHttpRequest);

        this.parseLocalization(target.response);

        this.events && this.events.dispatchEvent(new NitroLocalizationEvent(NitroLocalizationEvent.LOADED));
    }

    private onLocalizationFailed(event: ProgressEvent<EventTarget>): void
    {
        this.events && this.events.dispatchEvent(new NitroLocalizationEvent(NitroLocalizationEvent.FAILED));
    }

    private parseLocalization(data: any): void
    {
        if(!data) return;

        data = JSON.parse(data);

        for(const key in data) this._definitions.set(key, data[key]);
    }

    public getRomanNumeral(number: number): string
    {
        return this._romanNumerals[Math.max(0, (number - 1))];
    }

    public getBadgeBaseAndLevel(badgeName: string): string
    {
        const badge = new BadgeBaseAndLevel(badgeName);

        badge.level--;

        return badge.getBadgeId;
    }

    public getValue(key: string, doParams: boolean = true): string
    {
        if(key.startsWith('${')) key = key.substr(2, (key.length - 3));

        let value = (this._definitions.get(key) || null);

        if(value && doParams)
        {
            const parameters = this._parameters.get(key);

            if(parameters)
            {
                for(const [ parameter, replacement ] of parameters)
                {
                    value = value.replace('%' + parameter + '%', replacement);
                }
            }
        }

        return (value || key);
    }

    public getValueWithParameter(key: string, parameter: string, replacement: string): string
    {
        const value = this.getValue(key, false);

        const replacedValue =  value.replace('%' + parameter + '%', replacement);

        if(value.startsWith('%{'))
        {
            // This adds support for multi-optioned texts like
            // catalog.vip.item.header.months=%{NUM_MONTHS|0 months|1 month|%% months}
            // It only checks for this multi-optioned thext if the value of the key starts with %{

            // If it does, it will create a RegEx with the provided parameter, eg. NUM_DAYS or NUM_MONTS
            // Then, based on the provided replacement it searches for the resultgroup based on the replacement.
            // If the replacement is not either 0, 1 - it will be assumed it will be plural. (eg. Months)
            const regex = new RegExp('%{' + parameter.toUpperCase() + '\\|([^|]*)\\|([^|]*)\\|([^|]*)}');
            const result = value.match(regex);

            if(!result) return replacedValue;

            let indexKey =  -1;
            const replacementAsNumber = Number.parseInt(replacement);
            let replace = false;

            switch(replacementAsNumber)
            {
                case 0:
                    indexKey = 1;
                    break;
                case 1:
                    indexKey = 2;
                    break;
                default:
                case 2:
                    indexKey = 3;
                    replace = true;
                    break;
            }


            if(indexKey == -1 || typeof result[indexKey] == 'undefined')
            {
                return replacedValue;
            }

            const valueFromResults = result[indexKey];

            if(valueFromResults)
            {
                return valueFromResults.replace('%%', replacement);
            }
        }

        return replacedValue;
    }

    public getValueWithParameters(key: string, parameters: string[], replacements: string[]): string
    {
        let value = this.getValue(key, false);

        for(let i = 0; i < parameters.length; i++)
        {
            value = value.replace('%' + parameters[i] + '%', replacements[i]);
        }

        return value;
    }

    public setValue(key: string, value: string): void
    {
        this._definitions.set(key, value);
    }

    public registerParameter(key: string, parameter: string, value: string): void
    {
        if(!key || (key.length === 0) || !parameter || (parameter.length === 0)) return;

        let existing = this._parameters.get(key);

        if(!existing)
        {
            existing = new Map();

            this._parameters.set(key, existing);
        }

        existing.set(parameter, value);
    }

    public getBadgeName(key: string): string
    {
        const local2 = new BadgeBaseAndLevel(key);
        const keys = ['badge_name_' + key, 'badge_name_' + local2.base];
        const local3 = this._Str_2103(this.getExistingKey(keys))
            .replace('%roman%', this.getRomanNumeral(local2.level));



        return local3;
    }

    public getBadgeDesc(key: string): string
    {
        return '';
    }

    private getExistingKey(keys: string[]): string
    {
        for(const entry of keys)
        {
            const item = this.getValue(entry);
            if(item != entry) return item;
        }

        return '';
    }

    private  _Str_2103(k: string): string
    {
        return k.replace('${', '$')
            .replace('{', '$')
            .replace('}', '$');
    }
}
