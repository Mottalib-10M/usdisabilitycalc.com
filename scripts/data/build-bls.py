#!/usr/bin/env python3
"""Builds src/data/bls-ncs-2026.json from the BLS National Compensation Survey (Employee Benefits, March 2026).

Replayable:
  python3 scripts/data/build-bls.py --fetch     # asks api.bls.gov (public API v2, no key: 25 queries a day,
                                                # 25 series a query) and rewrites data-raw/bls-api-<date>.json
  python3 scripts/data/build-bls.py             # rebuilds the site file from the last raw file

Only the public API is used: bls.gov pages and download.bls.gov refuse scripts (BLS usage policy), and we do
not work around that. BLS material is in the public domain; the site cites the BLS as its source.

Series ID (bls.gov/help/hlpforma.htm, NB): NB + U + ownership(1) + estimate(2) + industry(6) + occupation(4)
+ subcell(2) + datatype(2) + provision(3). Ownership 1 civilian, 2 private, 3 state and local government.
Estimates 16 short-term disability, 17 long-term disability, 71 long-term care. Datatype 28 = share of workers
with access (percent), 33 = the same at plan/occupation level (used for long-term care), 20 = percent of
participants, 21-25 = 10th, 25th, 50th, 75th, 90th percentile.
"""
import glob, json, os, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
RAW = os.path.join(SITE, 'data-raw')
OUT = os.path.join(SITE, 'src', 'data', 'bls-ncs-2026.json')

BEN = {'std': ('16', '248', '28'), 'ltd': ('17', '322', '28'), 'ltc': ('71', '356', '33')}
INDUSTRIES = [
    ('230000', 'Construction'), ('300000', 'Manufacturing'), ('412000', 'Retail trade'), ('420000', 'Wholesale trade'),
    ('430000', 'Transportation and warehousing'), ('220000', 'Utilities'), ('510000', 'Information'),
    ('522000', 'Banking and credit'), ('524000', 'Insurance carriers'), ('530000', 'Real estate and rental'),
    ('540000', 'Professional, scientific and technical services'), ('560000', 'Administrative and support services'),
    ('610000', 'Educational services'), ('620000', 'Health care and social assistance'), ('622000', 'Hospitals'),
    ('720000', 'Accommodation and food services'), ('810000', 'Other services'),
]
SUBCELLS = [
    ('size', '02', 'Fewer than 50 workers'), ('size', '04', '50 to 99 workers'), ('size', '06', '100 to 499 workers'), ('size', '07', '500 workers or more'),
    ('region', '09', 'New England'), ('region', '10', 'Middle Atlantic'), ('region', '12', 'South Atlantic'), ('region', '13', 'East South Central'),
    ('region', '14', 'West South Central'), ('region', '16', 'East North Central'), ('region', '17', 'West North Central'),
    ('region', '19', 'Mountain'), ('region', '20', 'Pacific'),
    ('union', '23', 'Union workers'), ('union', '24', 'Nonunion workers'),
    ('hours', '25', 'Full-time workers'), ('hours', '26', 'Part-time workers'),
    ('wage', '56', 'Lowest-paid quarter of private workers'), ('wage', '57', 'Highest-paid quarter of private workers'),
]
PROVISIONS = {
    # key: (estimate, datatype, provision)
    'std_employee_pays_none': ('16', '20', '255'), 'std_employee_pays': ('16', '20', '256'),
    'std_fixed_pct_share': ('16', '20', '264'), 'std_median_pct': ('16', '23', '272'),
    'std_max_weekly_p10': ('16', '21', '274'), 'std_max_weekly_p25': ('16', '22', '275'), 'std_max_weekly_p50': ('16', '23', '276'),
    'std_max_weekly_p75': ('16', '24', '277'), 'std_max_weekly_p90': ('16', '25', '278'),
    'std_weeks_p10': ('16', '21', '283'), 'std_weeks_p25': ('16', '22', '284'), 'std_weeks_p50': ('16', '23', '285'),
    'std_weeks_p75': ('16', '24', '286'), 'std_weeks_p90': ('16', '25', '287'),
    'ltd_employee_pays_none': ('17', '20', '325'), 'ltd_employee_pays': ('17', '20', '326'),
    'ltd_fixed_pct_share': ('17', '20', '327'), 'ltd_median_pct': ('17', '23', '329'),
    'ltd_max_monthly_p10': ('17', '21', '336'), 'ltd_max_monthly_p25': ('17', '22', '337'), 'ltd_max_monthly_p50': ('17', '23', '338'),
    'ltd_max_monthly_p75': ('17', '24', '339'), 'ltd_max_monthly_p90': ('17', '25', '340'),
}


def sid(o, e, ind, sub, dt, prov):
    return f'NBU{o}{e}{ind}0000{sub}{dt}{prov}'


def wanted():
    ids = []
    for e, p, dt in BEN.values():
        for o in '123':
            ids.append(sid(o, e, '000000', '00', dt, p))
        for ind, _ in INDUSTRIES:
            ids.append(sid('2', e, ind, '00', dt, p))
        for _, sub, _ in SUBCELLS:
            ids.append(sid('2', e, '000000', sub, dt, p))
    for o in '123':
        for e, dt, p in PROVISIONS.values():
            ids.append(sid(o, e, '000000', '00', dt, p))
    return ids


def fetch():
    ids, series = wanted(), {}
    for k in range(0, len(ids), 25):
        body = json.dumps({'seriesid': ids[k:k + 25], 'startyear': '2024', 'endyear': '2026'}).encode()
        req = urllib.request.Request('https://api.bls.gov/publicAPI/v2/timeseries/data/', data=body, headers={'Content-Type': 'application/json'})
        d = json.load(urllib.request.urlopen(req, timeout=60))
        if d['status'] != 'REQUEST_SUCCEEDED':
            sys.exit(f'BLS API: {d}')
        for s in d['Results']['series']:
            series[s['seriesID']] = s['data']
        time.sleep(1)
    day = time.strftime('%Y-%m-%d')
    json.dump({'retrieved_at': day, 'source': 'https://api.bls.gov/publicAPI/v2/timeseries/data/', 'series': series},
              open(os.path.join(RAW, f'bls-api-{day}.json'), 'w'), indent=0)


def build():
    raw_file = sorted(glob.glob(os.path.join(RAW, 'bls-api-*.json')))[-1]
    raw = json.load(open(raw_file))
    S = raw['series']

    def val(i):
        """2026 annual value (March 2026 reference period), else None. Never a 2025 value passed off as 2026."""
        for x in S.get(i, []):
            if x['year'] == '2026' and x['period'] == 'A01':
                return float(x['value'])
        return None

    groups = []
    def row(kind, label, o, ind, sub):
        r = {'kind': kind, 'label': label}
        for k, (e, p, dt) in BEN.items():
            r[k] = val(sid(o, e, ind, sub, dt, p))
        if r['std'] is None and r['ltd'] is None:
            return
        groups.append(r)
    row('all', 'All civilian workers', '1', '000000', '00')
    row('all', 'Private industry', '2', '000000', '00')
    row('all', 'State and local government', '3', '000000', '00')
    for ind, label in INDUSTRIES:
        row('industry', label, '2', ind, '00')
    for kind, sub, label in SUBCELLS:
        row(kind, label, '2', '000000', sub)
    prov = {}
    for owner, o in (('civilian', '1'), ('private', '2'), ('government', '3')):
        prov[owner] = {k: val(sid(o, e, '000000', '00', dt, p)) for k, (e, dt, p) in PROVISIONS.items()}
    out = {
        'survey': 'National Compensation Survey, Employee Benefits in the United States, March 2026',
        'reference': 'March 2026', 'published': '2026-09-25', 'retrieved_at': raw['retrieved_at'],
        'source_api': 'BLS Public Data API v2 (POST to api.bls.gov/publicAPI/v2/timeseries/data/), documented at https://www.bls.gov/developers/', 'raw_file': os.path.relpath(raw_file, SITE),
        'note': 'Percent of workers with access to the plan; long-term care at plan and occupation level. Private industry for industries, sizes, regions, union, hours and wages.',
        'groups': groups, 'provisions': prov,
    }
    json.dump(out, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print(f'{OUT}: {len(groups)} groups, {sum(1 for g in groups for k in BEN if g[k] is not None)} values, provisions for {len(prov)} owners')


if __name__ == '__main__':
    if '--fetch' in sys.argv:
        fetch()
    build()
