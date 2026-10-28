--
-- PostgreSQL database dump
--

\restrict 2vjREVukQIuqmFIDhPic2iwNOqwlMf39zP10RgMahqNNG69KN3O0rXAnD1MbmYU

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: batch_cows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_cows (
    batch_id character varying(50) NOT NULL,
    cow_id character varying(50) NOT NULL
);


ALTER TABLE public.batch_cows OWNER TO postgres;

--
-- Name: batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batches (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    start_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'Active'::character varying,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    feeding_program jsonb,
    farm_location character varying(100),
    expected_selling_price numeric,
    selling_target_date date
);


ALTER TABLE public.batches OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    amount numeric(12,2) DEFAULT 0,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    farm_location character varying(100)
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: feed_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feed_products (
    id character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    unit character varying(50) DEFAULT 'bag'::character varying,
    weight_per_unit numeric(10,2) DEFAULT 30,
    unit_cost numeric(15,2) DEFAULT 0,
    min_threshold_bags numeric(10,2) DEFAULT 50,
    min_threshold_kg numeric(10,2) DEFAULT 1500,
    description text,
    supplier character varying(255),
    status character varying(50) DEFAULT 'Active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    cost_type character varying(20) DEFAULT 'per_bag'::character varying,
    cost_per_bag numeric(15,2) DEFAULT 0
);


ALTER TABLE public.feed_products OWNER TO postgres;

--
-- Name: feed_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feed_transactions (
    id character varying(100) NOT NULL,
    date timestamp with time zone NOT NULL,
    product_id character varying(100) NOT NULL,
    product_name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    quantity_bags numeric(12,2) DEFAULT 0,
    quantity_kg numeric(12,2) DEFAULT 0,
    unit_cost numeric(15,2) DEFAULT 0,
    total_cost numeric(15,2) DEFAULT 0,
    source_farm character varying(255),
    target_farm character varying(255),
    reference_no character varying(100),
    recorded_by character varying(255),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.feed_transactions OWNER TO postgres;

--
-- Name: health_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_logs (
    id character varying(50) NOT NULL,
    cow_id character varying(50) NOT NULL,
    type character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    administered_by character varying(100),
    cost numeric(10,2) DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.health_logs OWNER TO postgres;

--
-- Name: master_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_settings (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    data jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.master_settings OWNER TO postgres;

--
-- Name: master_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_settings_id_seq OWNER TO postgres;

--
-- Name: master_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_settings_id_seq OWNED BY public.master_settings.id;


--
-- Name: proposal_plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_plan (
    id character varying(20) NOT NULL,
    params jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.proposal_plan OWNER TO postgres;

--
-- Name: sales_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_tracking (
    id integer NOT NULL,
    cow_id character varying(50) NOT NULL,
    breed character varying(50),
    age character varying(50),
    weight numeric(10,2) DEFAULT 0,
    unit_price numeric(12,2) DEFAULT 0,
    total_price numeric(12,2) DEFAULT 0,
    status character varying(50) DEFAULT 'Sold'::character varying,
    sales_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    sale_type character varying(50),
    buyer character varying(100)
);


ALTER TABLE public.sales_tracking OWNER TO postgres;

--
-- Name: sales_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_tracking_id_seq OWNER TO postgres;

--
-- Name: sales_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_tracking_id_seq OWNED BY public.sales_tracking.id;


--
-- Name: stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock (
    id character varying(50) NOT NULL,
    no character varying(20) NOT NULL,
    breed character varying(50),
    sex character varying(20),
    age character varying(50),
    weight numeric(10,2) DEFAULT 0,
    owner_name character varying(100),
    location character varying(100),
    phone character varying(50),
    buy_type character varying(50),
    unit_price numeric(12,2) DEFAULT 0,
    total_price numeric(12,2) DEFAULT 0,
    health_status character varying(50) DEFAULT 'Good'::character varying,
    status character varying(50) DEFAULT 'Active'::character varying,
    purchase_date timestamp with time zone,
    remark text,
    purchase_type character varying(50),
    payment_method character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    image_url text
);


ALTER TABLE public.stock OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'Active'::character varying,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    permissions jsonb DEFAULT '[]'::jsonb,
    farm_location character varying(100),
    pin_hash character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: weight_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weight_tracking (
    id integer NOT NULL,
    cow_id character varying(50) NOT NULL,
    breed character varying(50),
    age character varying(50),
    old_weight numeric(10,2) DEFAULT 0,
    current_weight numeric(10,2) DEFAULT 0,
    gain_loss numeric(10,4) DEFAULT 0,
    health_status character varying(50),
    status character varying(50),
    tracking_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.weight_tracking OWNER TO postgres;

--
-- Name: weight_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weight_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weight_tracking_id_seq OWNER TO postgres;

--
-- Name: weight_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weight_tracking_id_seq OWNED BY public.weight_tracking.id;


--
-- Name: master_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_settings ALTER COLUMN id SET DEFAULT nextval('public.master_settings_id_seq'::regclass);


--
-- Name: sales_tracking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_tracking ALTER COLUMN id SET DEFAULT nextval('public.sales_tracking_id_seq'::regclass);


--
-- Name: weight_tracking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_tracking ALTER COLUMN id SET DEFAULT nextval('public.weight_tracking_id_seq'::regclass);


--
-- Data for Name: batch_cows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_cows (batch_id, cow_id) FROM stdin;
FAT-2026-961	CC-035
BAT-2026-590	CC-013
BAT-2026-590	CC-010
BAT-2026-590	CC-017
FAT-2026-961	CC-012
FAT-2026-961	CC-019
FAT-2026-961	CC-020
FAT-2026-961	CC-016
FAT-2026-961	CC-003
FAT-2026-961	CC-015
FAT-2026-961	CC-021
FAT-2026-961	CC-001
FAT-2026-961	CC-022
FAT-2026-961	CC-029
FAT-2026-961	CC-025
FAT-2026-961	CC-039
FAT-2026-961	CC-028
FAT-2026-961	CC-032
FAT-2026-961	CC-038
FAT-2026-961	CC-034
FAT-2026-961	CC-040
FAT-2026-961	CC-024
FAT-2026-961	CC-023
FAT-2026-961	CC-036
FAT-2026-961	CC-027
FAT-2026-961	CC-037
FAT-2026-961	CC-030
FAT-2026-961	CC-026
FAT-2026-961	CC-033
FAT-2026-961	CC-031
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, name, type, start_date, status, notes, created_at, feeding_program, farm_location, expected_selling_price, selling_target_date) FROM stdin;
BAT-2026-590	ហ្វូងបំប៉នថ្មី  Test	Fattening Program	2026-07-24 00:00:00+00	Active		2026-07-24 04:32:53.377061+00	{"notes": "Default fattening ration.", "status": "Active", "frequency": "Twice Daily", "startDate": "2026-07-24", "ingredients": [{"name": "DSR-16 Cow Feed", "unitCost": 1366.67, "portionPerHead": 7}]}	SNR Farm	12500	\N
FAT-2026-961	Batch01_10/06/2026	Fattening Program	2026-06-11 00:00:00+00	Active	Fattening program started on 6/11/2026.	2026-07-23 08:14:55.386+00	{"notes": "Default recommended fattening program diet.", "status": "Active", "frequency": "Once Daily", "startDate": "2026-06-11", "ingredients": [{"name": "DSR-16 Cow Feed", "unitCost": 1366.67, "portionPerHead": 6}]}	SNR Farm	12500	\N
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, category, amount, date, description, created_at, farm_location) FROM stdin;
EXP-20260407-001	ផ្សេងៗ	119000.00	2026-04-07 00:00:00+00	ជួសជុលម៉ូតូ	2026-07-24 07:43:40.859009+00	SNR Farm
EXP-20260407-002	ផ្សេងៗ	40000.00	2026-04-07 00:00:00+00	ម៉ែត្រវាស់គោ	2026-07-24 07:43:40.873221+00	SNR Farm
EXP-20260407-003	ផ្សេងៗ	8000.00	2026-04-07 00:00:00+00	កាត់ទូរស័ព្ទ បង់ភ័ក	2026-07-24 07:43:40.874663+00	SNR Farm
EXP-20260407-004	ផ្សេងៗ	40000.00	2026-04-07 00:00:00+00	រត់ឯកសារ និងផ្សេងៗ	2026-07-24 07:43:40.876655+00	SNR Farm
EXP-20260407-005	ផ្សេងៗ	100000.00	2026-04-07 00:00:00+00	ប៊ឺង និងផ្លែឈើ	2026-07-24 07:43:40.878004+00	SNR Farm
EXP-20260407-006	ផ្សេងៗ	30000.00	2026-04-07 00:00:00+00	ទុយោទឹក	2026-07-24 07:43:40.880097+00	SNR Farm
EXP-20260420-002	ផ្សេងៗ	150000.00	2026-04-20 00:00:00+00	សេវាក្រូគោ	2026-07-24 07:43:40.881929+00	SNR Farm
EXP-20260420-003	ចំណី	146000.00	2026-04-20 00:00:00+00	កន្ទក់	2026-07-24 07:43:40.883437+00	SNR Farm
EXP-113-001	ផ្សេងៗ	119000.00	2026-04-07 00:00:00+00	ជួសជុលម៉ូតូ	2026-07-24 07:52:30.06663+00	SNR Farm
EXP-113-002	ផ្សេងៗ	40000.00	2026-04-07 00:00:00+00	ម៉ែត្រវាស់គោ	2026-07-24 07:52:30.078472+00	SNR Farm
EXP-113-003	ផ្សេងៗ	8000.00	2026-04-07 00:00:00+00	កាត់ទូរស័ព្ទ បង់ភ័ក	2026-07-24 07:52:30.079781+00	SNR Farm
EXP-113-004	ផ្សេងៗ	40000.00	2026-04-07 00:00:00+00	រត់ឯកសារ និងផ្សេងៗ	2026-07-24 07:52:30.080574+00	SNR Farm
EXP-113-005	ផ្សេងៗ	100000.00	2026-04-07 00:00:00+00	ប៊ឺង និងផ្លែឈើ	2026-07-24 07:52:30.08164+00	SNR Farm
EXP-113-006	ផ្សេងៗ	30000.00	2026-04-07 00:00:00+00	ទុយោទឹក	2026-07-24 07:52:30.082303+00	SNR Farm
EXP-113-007	ផ្សេងៗ	450000.00	2026-04-20 00:00:00+00	សាហុយ	2026-07-24 07:52:30.082984+00	SNR Farm
EXP-113-008	ផ្សេងៗ	150000.00	2026-04-20 00:00:00+00	សេវាក្រូគោ	2026-07-24 07:52:30.08522+00	SNR Farm
EXP-113-009	ចំណី	146000.00	2026-04-20 00:00:00+00	កន្ទក់	2026-07-24 07:52:30.086133+00	SNR Farm
EXP-113-010	ផ្សេងៗ	400000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.086917+00	SNR Farm
EXP-113-011	ផ្សេងៗ	120000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.087906+00	SNR Farm
EXP-113-012	ផ្សេងៗ	10000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.08849+00	SNR Farm
EXP-113-013	ផ្សេងៗ	10000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.089765+00	SNR Farm
EXP-113-014	ផ្សេងៗ	6000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.090426+00	SNR Farm
EXP-113-015	ផ្សេងៗ	150000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.091109+00	SNR Farm
EXP-113-016	ផ្សេងៗ	40000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.091732+00	SNR Farm
EXP-113-017	ផ្សេងៗ	20000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.092391+00	SNR Farm
EXP-113-018	ផ្សេងៗ	20000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.093105+00	SNR Farm
EXP-113-019	ផ្សេងៗ	6000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.093708+00	SNR Farm
EXP-113-020	ផ្សេងៗ	22000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.095052+00	SNR Farm
EXP-113-021	ផ្សេងៗ	5000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.096113+00	SNR Farm
EXP-113-022	ផ្សេងៗ	53500.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.096869+00	SNR Farm
EXP-113-023	ផ្សេងៗ	20000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.097923+00	SNR Farm
EXP-113-024	ផ្សេងៗ	20000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.098674+00	SNR Farm
EXP-113-025	ផ្សេងៗ	40000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.099319+00	SNR Farm
EXP-113-026	ផ្សេងៗ	5500.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.100141+00	SNR Farm
EXP-113-027	ផ្សេងៗ	5000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.101203+00	SNR Farm
EXP-113-028	ផ្សេងៗ	11000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.102111+00	SNR Farm
EXP-113-029	ផ្សេងៗ	242000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.102663+00	SNR Farm
EXP-113-030	ផ្សេងៗ	15000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.103258+00	SNR Farm
EXP-113-031	ផ្សេងៗ	100000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.103887+00	SNR Farm
EXP-113-032	ទឹក-ភ្លើង	61600.00	2026-06-01 00:00:00+00	ថ្លៃភ្លើង	2026-07-24 07:52:30.104599+00	SNR Farm
EXP-113-033	ទ្រព្យសកម្ម	35000.00	2026-06-01 00:00:00+00	កូនដងក	2026-07-24 07:52:30.105605+00	SNR Farm
EXP-113-034	ទ្រព្យសកម្ម	932000.00	2026-06-01 00:00:00+00	សំណង់ឌី	2026-07-24 07:52:30.106349+00	SNR Farm
EXP-113-035	ទឹក-ភ្លើង	257000.00	2026-06-01 00:00:00+00	តូលាង	2026-07-24 07:52:30.107133+00	SNR Farm
EXP-113-036	ផ្សេងៗ	20000.00	2026-06-01 00:00:00+00	ដូរប្រេង ម៉ាស៊ីន	2026-07-24 07:52:30.107894+00	SNR Farm
EXP-113-037	ផ្សេងៗ	16500.00	2026-06-01 00:00:00+00	សាំង	2026-07-24 07:52:30.108633+00	SNR Farm
EXP-113-038	ផ្សេងៗ	300000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.109373+00	SNR Farm
EXP-113-039	ផ្សេងៗ	20000.00	2026-06-01 00:00:00+00	ផ្សេងៗ	2026-07-24 07:52:30.1102+00	SNR Farm
EXP-113-040	ផ្សេងៗ	26000.00	2026-06-01 00:00:00+00	U90	2026-07-24 07:52:30.110961+00	SNR Farm
EXP-113-041	ផ្សេងៗ	72000.00	2026-06-01 00:00:00+00	Banner	2026-07-24 07:52:30.111724+00	SNR Farm
EXP-113-042	វ៉ាក់សាំង និងថ្នាំ	100000.00	2026-06-01 00:00:00+00	ចាក់ថ្នាំគោ	2026-07-24 07:52:30.112508+00	SNR Farm
EXP-113-043	ចំបើង	1050000.00	2026-06-01 00:00:00+00	ចំបើង	2026-07-24 07:52:30.113174+00	SNR Farm
EXP-113-044	ផ្សេងៗ	8000.00	2026-06-01 00:00:00+00	ខ្សែ គោ	2026-07-24 07:52:30.113769+00	SNR Farm
EXP-113-045	ទ្រព្យសកម្ម	600000.00	2026-06-01 00:00:00+00	ម៉ូទ័រ	2026-07-24 07:52:30.116652+00	SNR Farm
EXP-113-046	វ៉ាក់សាំង និងថ្នាំ	40000.00	2026-06-01 00:00:00+00	ថ្នាំ EM	2026-07-24 07:52:30.118408+00	SNR Farm
EXP-113-047	ទ្រព្យសកម្ម	280000.00	2026-06-01 00:00:00+00	កាមេរ៉ាផងបងភ័ក	2026-07-24 07:52:30.119331+00	SNR Farm
EXP-113-048	វ៉ាក់សាំង និងថ្នាំ	290000.00	2026-06-01 00:00:00+00	ថ្នាំ អកគោ	2026-07-24 07:52:30.120029+00	SNR Farm
EXP-113-049	ផ្សេងៗ	15000.00	2026-06-01 00:00:00+00	សាំង ៣លីត្រ	2026-07-24 07:52:30.120636+00	SNR Farm
EXP-113-050	ចំបើង	875000.00	2026-06-01 00:00:00+00	ចំបើង ២៥០ដុំ	2026-07-24 07:52:30.121216+00	SNR Farm
EXP-113-051	ផ្សេងៗ	20000.00	2026-06-01 00:00:00+00	សាំង	2026-07-24 07:52:30.121844+00	SNR Farm
EXP-113-052	ផ្សេងៗ	12000.00	2026-06-01 00:00:00+00	ទឹកក្រូច	2026-07-24 07:52:30.122402+00	SNR Farm
EXP-113-053	ផ្សេងៗ	15000.00	2026-06-01 00:00:00+00	ស្រាស	2026-07-24 07:52:30.122924+00	SNR Farm
EXP-113-054	ទ្រព្យសកម្ម	267000.00	2026-06-01 00:00:00+00	កង្ហារ ៦គ្រាប់	2026-07-24 07:52:30.123548+00	SNR Farm
EXP-113-055	ទ្រព្យសកម្ម	164000.00	2026-06-01 00:00:00+00	សំណង់ឌី	2026-07-24 07:52:30.124236+00	SNR Farm
EXP-113-056	ទ្រព្យសកម្ម	19000.00	2026-06-01 00:00:00+00	សំណង់ឌី	2026-07-24 07:52:30.124872+00	SNR Farm
EXP-113-057	ទ្រព្យសកម្ម	35000.00	2026-06-01 00:00:00+00	សំណង់ឌី	2026-07-24 07:52:30.125481+00	SNR Farm
EXP-113-058	ទ្រព្យសកម្ម	650000.00	2026-06-01 00:00:00+00	ទិញធុងដាក់ផ្អែម	2026-07-24 07:52:30.126348+00	SNR Farm
EXP-113-059	ពោត	336000.00	2026-06-01 00:00:00+00	ពោត ៤៨ វ	2026-07-24 07:52:30.127055+00	SNR Farm
EXP-113-060	ផ្សេងៗ	20000.00	2026-06-01 00:00:00+00	បង់ភ័ក	2026-07-24 07:52:30.127683+00	SNR Farm
EXP-113-061	ទ្រព្យសកម្ម	400000.00	2026-06-01 00:00:00+00	ថ្លៃជាង	2026-07-24 07:52:30.128337+00	SNR Farm
EXP-113-062	ផ្សេងៗ	80000.00	2026-06-01 00:00:00+00	ខ្សែក្លើង	2026-07-24 07:52:30.129064+00	SNR Farm
EXP-113-063	ប្រាក់ខែ	2000000.00	2026-06-01 00:00:00+00	ចំណាយបង់ភ័ក	2026-07-24 07:52:30.129899+00	SNR Farm
EXP-113-064	ទ្រព្យសកម្ម	3012000.00	2026-06-01 00:00:00+00	ថ្លៃដែក	2026-07-24 07:52:30.130489+00	SNR Farm
EXP-113-065	ទ្រព្យសកម្ម	1584000.00	2026-06-01 00:00:00+00	សំណង់ឌី	2026-07-24 07:52:30.131117+00	SNR Farm
EXP-113-066	ទ្រព្យសកម្ម	600000.00	2026-06-01 00:00:00+00	ថ្លៃធុង	2026-07-24 07:52:30.13184+00	SNR Farm
EXP-113-067	ទ្រព្យសកម្ម	189000.00	2026-06-01 00:00:00+00	សំណង់ឌី	2026-07-24 07:52:30.132613+00	SNR Farm
EXP-113-069	ពោត	350000.00	2026-06-01 00:00:00+00	ពោត ៥០ វ	2026-07-24 07:52:30.133343+00	SNR Farm
EXP-113-071	ទ្រព្យសកម្ម	2800000.00	2026-06-01 00:00:00+00	ម៉ាស៊ីនកិនផ្អែម	2026-07-24 07:52:30.134297+00	SNR Farm
EXP-113-072	ទ្រព្យសកម្ម	1564000.00	2026-06-01 00:00:00+00	ជណ្តើរឡើងគោ	2026-07-24 07:52:30.135031+00	SNR Farm
EXP-113-073	ផ្សេងៗ	300000.00	2026-07-01 00:00:00+00	ជួសជុលម៉ូតូ	2026-07-24 07:52:30.135673+00	SNR Farm
EXP-113-074	ផ្សេងៗ	50000.00	2026-07-02 00:00:00+00	ថ្លៃសាំង ក្មេងៗ និងជាង	2026-07-24 07:52:30.13624+00	SNR Farm
EXP-113-075	វ៉ាក់សាំង និងថ្នាំ	50000.00	2026-07-03 00:00:00+00	ថ្នាំគោ ឺ	2026-07-24 07:52:30.136806+00	SNR Farm
EXP-113-076	ផ្សេងៗ	9000.00	2026-07-06 00:00:00+00	សាំង	2026-07-24 07:52:30.137812+00	SNR Farm
EXP-113-077	ផ្សេងៗ	50000.00	2026-07-06 00:00:00+00	យទឹកកម្មករ កាប់ពោត	2026-07-24 07:52:30.138863+00	SNR Farm
EXP-113-078	ផ្សេងៗ	60000.00	2026-07-06 00:00:00+00	សាំង	2026-07-24 07:52:30.139738+00	SNR Farm
EXP-113-079	ពោត	100000.00	2026-07-06 00:00:00+00	បង់ភ័ក (ថ្លៃដើមពោត)	2026-07-24 07:52:30.140797+00	SNR Farm
EXP-113-080	ទ្រព្យសកម្ម	100000.00	2026-07-06 00:00:00+00	ថ្លៃជាង(អាស៊ី)	2026-07-24 07:52:30.14141+00	SNR Farm
EXP-113-081	ទ្រព្យសកម្ម	124000.00	2026-07-06 00:00:00+00	គ្រឿងសំណង់ឌី	2026-07-24 07:52:30.14199+00	SNR Farm
EXP-113-082	ទ្រព្យសកម្ម	170000.00	2026-07-06 00:00:00+00	ថ្លៃជាងពូរុ(ំ៣ថ្លៃកន្លះ)	2026-07-24 07:52:30.142524+00	SNR Farm
EXP-113-083	ទ្រព្យសកម្ម	2297640.00	2026-07-07 00:00:00+00	ថ្លៃស័ង្កសី	2026-07-24 07:52:30.143049+00	SNR Farm
EXP-113-084	ទ្រព្យសកម្ម	62000.00	2026-07-07 00:00:00+00	គ្រឿងសំណង់ឌី	2026-07-24 07:52:30.143567+00	SNR Farm
EXP-113-085	ទ្រព្យសកម្ម	220000.00	2026-07-07 00:00:00+00	ថ្លៃដើមដើមពោត	2026-07-24 07:52:30.144112+00	SNR Farm
EXP-113-086	ការប្រាក់ធនាគារ	1653320.00	2026-07-07 00:00:00+00	ការប្រាក់ ARDB	2026-07-24 07:52:30.144832+00	SNR Farm
EXP-113-087	ផ្សេងៗ	67000.00	2026-07-07 00:00:00+00	សាំង	2026-07-24 07:52:30.145524+00	SNR Farm
EXP-113-088	ផ្សេងៗ	160000.00	2026-07-08 00:00:00+00	សាច់ស្អុយ	2026-07-24 07:52:30.146455+00	SNR Farm
EXP-113-089	ទ្រព្យសកម្ម	17000.00	2026-07-08 00:00:00+00	អីវ៉ាន់ជាង និងកម្មករ	2026-07-24 07:52:30.14698+00	SNR Farm
EXP-113-090	ផ្សេងៗ	50000.00	2026-07-08 00:00:00+00	ថ្លែលង់ដាក់ពោត	2026-07-24 07:52:30.14743+00	SNR Farm
EXP-113-091	ទ្រព្យសកម្ម	472000.00	2026-07-08 00:00:00+00	គ្រឿងសំណង់ឌី	2026-07-24 07:52:30.147921+00	SNR Farm
EXP-113-092	ទ្រព្យសកម្ម	447000.00	2026-07-08 00:00:00+00	ស័ង្កសី	2026-07-24 07:52:30.148393+00	SNR Farm
EXP-113-093	ផ្សេងៗ	55000.00	2026-07-09 00:00:00+00	ទុយោ	2026-07-24 07:52:30.148865+00	SNR Farm
EXP-113-094	ផ្សេងៗ	105000.00	2026-07-09 00:00:00+00	ថ្លែលង់ដាក់ពោត	2026-07-24 07:52:30.149482+00	SNR Farm
EXP-113-095	វ៉ាក់សាំង និងថ្នាំ	80000.00	2026-07-09 00:00:00+00	ថ្នាំចាក់គោ	2026-07-24 07:52:30.149984+00	SNR Farm
EXP-113-096	វ៉ាក់សាំង និងថ្នាំ	50000.00	2026-07-11 00:00:00+00	ថ្នាំចាក់គោ	2026-07-24 07:52:30.150729+00	SNR Farm
EXP-113-097	ទ្រព្យសកម្ម	2613480.00	2026-07-12 00:00:00+00	ថ្លៃជាងសទេះបង់ភ័ក	2026-07-24 07:52:30.151807+00	SNR Farm
EXP-113-098	ពោត	100000.00	2026-07-13 00:00:00+00	ថ្លៃគ្រាប់ពោត	2026-07-24 07:52:30.153036+00	SNR Farm
EXP-113-099	ផ្សេងៗ	100000.00	2026-07-13 00:00:00+00	ថ្លែកម្មករ (អាសោម)	2026-07-24 07:52:30.153628+00	SNR Farm
EXP-113-100	វ៉ាក់សាំង និងថ្នាំ	76800.00	2026-07-13 00:00:00+00	ថ្លៃភ្លើងសទេះបង់ភ័ក	2026-07-24 07:52:30.154167+00	SNR Farm
EXP-113-101	ផ្សេងៗ	13000.00	2026-07-13 00:00:00+00	សាំង	2026-07-24 07:52:30.154654+00	SNR Farm
EXP-113-102	វ៉ាក់សាំង និងថ្នាំ	43900.00	2026-07-13 00:00:00+00	ថ្លៃភ្លើងសទេះបង់ភ័ក	2026-07-24 07:52:30.155165+00	SNR Farm
EXP-113-103	ផ្សេងៗ	4500.00	2026-07-14 00:00:00+00	សាំង	2026-07-24 07:52:30.155837+00	SNR Farm
EXP-113-104	ផ្សេងៗ	11000.00	2026-07-14 00:00:00+00	ភេសជ្ជៈជាង	2026-07-24 07:52:30.156338+00	SNR Farm
EXP-113-105	ទ្រព្យសកម្ម	80000.00	2026-07-14 00:00:00+00	ឧបករណ៍ហោងទឹក	2026-07-24 07:52:30.156834+00	SNR Farm
EXP-113-106	ទ្រព្យសកម្ម	382000.00	2026-07-14 00:00:00+00	សំណង់ឌី	2026-07-24 07:52:30.157276+00	SNR Farm
EXP-113-107	ផ្សេងៗ	21000.00	2026-07-15 00:00:00+00	សាំង	2026-07-24 07:52:30.157803+00	SNR Farm
EXP-113-108	វ៉ាក់សាំង និងថ្នាំ	238800.00	2026-07-15 00:00:00+00	ថ្លៃថ្នាំចាក់គោ	2026-07-24 07:52:30.158452+00	SNR Farm
EXP-113-109	ផ្សេងៗ	21000.00	2026-07-15 00:00:00+00	ភេសជ្ជៈជាង	2026-07-24 07:52:30.15916+00	SNR Farm
EXP-113-110	ចំបើង	580000.00	2026-07-16 00:00:00+00	ថ្លៃដើមពោត និងកម្លាំងកម្មករ	2026-07-24 07:52:30.159703+00	SNR Farm
EXP-113-111	ផ្សេងៗ	33000.00	2026-07-16 00:00:00+00	សាំង	2026-07-24 07:52:30.160256+00	SNR Farm
EXP-113-112	ផ្សេងៗ	110000.00	2026-07-16 00:00:00+00	ថ្លែលង់ដាក់ពោត	2026-07-24 07:52:30.160772+00	SNR Farm
EXP-113-113	ពោត	300000.00	2026-07-17 00:00:00+00	ថ្លៃដើមពោត និងកម្លាំងកម្មករ	2026-07-24 07:52:30.161277+00	SNR Farm
EXP-BCX9NSCOC	Feed	8202000.00	2026-07-23 00:00:00+00	Feed Procurement: DSR-16 Fattening Feed (200 bags / 6000 kg) - Ref: TX-640152	2026-07-24 08:54:15.296768+00	SNR Farm
EXP-ATK1CVDRY	Feed	20500050.00	2026-07-24 00:00:00+00	Feed Procurement: DSR-16 Cow Feed (500 bags / 15000 kg) - Ref: TX-673823	2026-07-24 08:54:15.296768+00	SNR Farm
EXP-UUFOFZTD8	Feed	20500050.00	2026-07-24 00:00:00+00	Feed Procurement: DSR-16 Cow Feed (500 bags / 15000 kg) - Ref: TX-723879	2026-07-24 08:54:15.296768+00	SNR Farm
\.


--
-- Data for Name: feed_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feed_products (id, name, category, unit, weight_per_unit, unit_cost, min_threshold_bags, min_threshold_kg, description, supplier, status, created_at, cost_type, cost_per_bag) FROM stdin;
PROD-F01	DSR-16 Cow Feed	MTR Feed	bag	30.00	1366.67	50.00	1500.00	High-protein commercial fattening concentrate ration (30kg/bag).	Dangkao Pang	Active	2026-07-23 10:57:44.146+00	per_bag	41000.00
\.


--
-- Data for Name: feed_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feed_transactions (id, date, product_id, product_name, type, quantity_bags, quantity_kg, unit_cost, total_cost, source_farm, target_farm, reference_no, recorded_by, notes, created_at) FROM stdin;
TX-AUTO-1784863219928-481	2026-06-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.928395+00
TX-AUTO-1784863219933-162	2026-06-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.933133+00
TX-AUTO-1784863219936-776	2026-06-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.935089+00
TX-AUTO-1784863219937-509	2026-06-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.938163+00
TX-AUTO-1784863219940-715	2026-06-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.939695+00
TX-AUTO-1784863219942-334	2026-06-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.941064+00
TX-AUTO-1784863219943-242	2026-06-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.942014+00
TX-AUTO-1784863219944-244	2026-06-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.942987+00
TX-AUTO-1784863219945-169	2026-06-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.944377+00
TX-AUTO-1784863219947-193	2026-06-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.948133+00
TX-AUTO-1784863219951-42	2026-06-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.951045+00
TX-AUTO-1784863219957-850	2026-06-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.956589+00
TX-AUTO-1784863219958-605	2026-06-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.958267+00
TX-AUTO-1784863219960-849	2026-06-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.960083+00
TX-AUTO-1784863219963-9	2026-06-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.962311+00
TX-AUTO-1784863219965-842	2026-06-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.964941+00
TX-AUTO-1784863219967-339	2026-06-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.966274+00
TX-AUTO-1784863219968-320	2026-06-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.967637+00
TX-AUTO-1784863219970-11	2026-06-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.968762+00
TX-AUTO-1784863219971-824	2026-06-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.971926+00
TX-AUTO-1784863219975-761	2026-06-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.974954+00
TX-AUTO-1784863219977-284	2026-06-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.976419+00
TX-AUTO-1784863219978-991	2026-06-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.977925+00
TX-AUTO-1784863219980-846	2026-06-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.979672+00
TX-AUTO-1784863219982-433	2026-06-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.980902+00
TX-AUTO-1784863219989-446	2026-06-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.988674+00
TX-AUTO-1784863219992-418	2026-06-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.991711+00
TX-AUTO-1784863219995-34	2026-06-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.994529+00
TX-AUTO-1784863220000-987	2026-06-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.000169+00
TX-AUTO-1784863220004-809	2026-06-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.004243+00
TX-AUTO-1784863220008-732	2026-06-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.007571+00
TX-AUTO-1784863220010-614	2026-06-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.009666+00
TX-AUTO-1784863220014-825	2026-06-30 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-30-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.013592+00
TX-AUTO-1784863220019-885	2026-07-01 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-01-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.01866+00
TX-AUTO-1784863220025-818	2026-07-02 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-02-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.024501+00
TX-AUTO-1784863220028-319	2026-07-03 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-03-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.027796+00
TX-AUTO-1784863220032-636	2026-07-04 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-04-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.031057+00
TX-AUTO-1784863220035-333	2026-07-05 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-05-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.034713+00
TX-AUTO-1784863220042-932	2026-07-06 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-06-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.041195+00
TX-AUTO-1784863220045-528	2026-07-07 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-07-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.045958+00
TX-AUTO-1784863220051-858	2026-07-08 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-08-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.050838+00
TX-AUTO-1784863220056-271	2026-07-09 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-09-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.055186+00
TX-AUTO-1784863220060-291	2026-07-10 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-10-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.05923+00
TX-AUTO-1784863220063-276	2026-07-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.062769+00
TX-AUTO-1784863220067-954	2026-07-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.066788+00
TX-AUTO-1784863220073-100	2026-07-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.072881+00
TX-AUTO-1784863220077-745	2026-07-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.076333+00
TX-AUTO-1784863220082-93	2026-07-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.081949+00
TX-AUTO-1784863219983-921	2026-06-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.983183+00
TX-AUTO-1784863219991-353	2026-06-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.990466+00
TX-AUTO-1784863219997-652	2026-06-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.996296+00
TX-AUTO-1784863220006-116	2026-06-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.007161+00
TX-AUTO-1784863220012-310	2026-06-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.011176+00
TX-AUTO-1784863220022-23	2026-06-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.021738+00
TX-AUTO-1784863220030-639	2026-06-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.029528+00
TX-AUTO-1784863220037-542	2026-06-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.036654+00
TX-AUTO-1784863220049-761	2026-06-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.049047+00
TX-AUTO-1784863220058-334	2026-06-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.057512+00
TX-AUTO-1784863220065-176	2026-06-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.065086+00
TX-AUTO-1784863220075-812	2026-06-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.074341+00
TX-AUTO-1784863220084-36	2026-06-30 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-30-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.083651+00
TX-AUTO-1784863220094-983	2026-07-01 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-01-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.093886+00
TX-AUTO-1784863220103-328	2026-07-02 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-02-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.101949+00
TX-AUTO-1784863220113-734	2026-07-03 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-03-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.113143+00
TX-AUTO-1784863220121-57	2026-07-04 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-04-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.120573+00
TX-AUTO-1784863220141-369	2026-07-05 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-05-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.140549+00
TX-AUTO-1784863220146-256	2026-07-06 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-06-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.145268+00
TX-AUTO-1784863220151-2	2026-07-07 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-07-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.15079+00
TX-AUTO-1784863220157-840	2026-07-08 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-08-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.157208+00
TX-AUTO-1784863220162-144	2026-07-09 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-09-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.162571+00
TX-AUTO-1784863220170-667	2026-07-10 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-10-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.170428+00
TX-AUTO-1784863220178-888	2026-07-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.179846+00
TX-AUTO-1784863219986-423	2026-06-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.986176+00
TX-AUTO-1784863219994-776	2026-06-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:19.993102+00
TX-AUTO-1784863220003-716	2026-06-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.001935+00
TX-AUTO-1784863220009-145	2026-06-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.008433+00
TX-AUTO-1784863220016-110	2026-06-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.016064+00
TX-AUTO-1784863220027-62	2026-06-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.026221+00
TX-AUTO-1784863220034-5	2026-06-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.033477+00
TX-AUTO-1784863220043-828	2026-06-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.042741+00
TX-AUTO-1784863220053-831	2026-06-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.053208+00
TX-AUTO-1784863220061-15	2026-06-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.060658+00
TX-AUTO-1784863220069-65	2026-06-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.069493+00
TX-AUTO-1784863220079-519	2026-06-30 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-06-30-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.078197+00
TX-AUTO-1784863220088-407	2026-07-01 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-01-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.088283+00
TX-AUTO-1784863220098-252	2026-07-02 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-02-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.098238+00
TX-AUTO-1784863220108-795	2026-07-03 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-03-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.107275+00
TX-AUTO-1784863220117-165	2026-07-04 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-04-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.116281+00
TX-AUTO-1784863220126-706	2026-07-05 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-05-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.124968+00
TX-AUTO-1784863220147-750	2026-07-06 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-06-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.146704+00
TX-AUTO-1784863220154-656	2026-07-07 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-07-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.15411+00
TX-AUTO-1784863220160-733	2026-07-08 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-08-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.15949+00
TX-AUTO-1784863220165-36	2026-07-09 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-09-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.164982+00
TX-AUTO-1784863220173-196	2026-07-10 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-10-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.173705+00
TX-AUTO-1784863220184-34	2026-07-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.185042+00
TX-AUTO-1784863220201-627	2026-07-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.201247+00
TX-AUTO-1784863220086-839	2026-07-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.085892+00
TX-AUTO-1784863220092-578	2026-07-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.091623+00
TX-AUTO-1784863220096-938	2026-07-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.095613+00
TX-AUTO-1784863220101-393	2026-07-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.100043+00
TX-AUTO-1784863220105-246	2026-07-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.104712+00
TX-AUTO-1784863220109-506	2026-07-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.108508+00
TX-AUTO-1784863220115-440	2026-07-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.114236+00
TX-AUTO-1784863220119-543	2026-07-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.118463+00
TX-AUTO-1784863220123-750	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.122849+00
TX-AUTO-1784863220198-515	2026-07-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.198266+00
TX-AUTO-1784863220204-212	2026-07-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.205325+00
TX-AUTO-1784863220210-27	2026-07-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.210342+00
TX-AUTO-1784863220216-466	2026-07-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.216244+00
TX-AUTO-1784863220222-809	2026-07-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.222538+00
TX-AUTO-1784863220228-799	2026-07-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.227281+00
TX-AUTO-1784863220233-364	2026-07-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.233234+00
TX-AUTO-1784863220261-938	2026-07-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.260579+00
TX-AUTO-1784863220268-333	2026-07-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.269314+00
TX-AUTO-1784863220279-590	2026-07-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.278879+00
TX-AUTO-1784863220287-841	2026-07-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.286688+00
TX-AUTO-1784863220293-372	2026-07-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.293519+00
TX-AUTO-1784863220303-494	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.302336+00
TX-AUTO-1784863220208-672	2026-07-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.207835+00
TX-AUTO-1784863220213-494	2026-07-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.213091+00
TX-AUTO-1784863220219-357	2026-07-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.218487+00
TX-AUTO-1784863220226-726	2026-07-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.225155+00
TX-AUTO-1784863220231-944	2026-07-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.230865+00
TX-AUTO-1784863220248-211	2026-07-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.250534+00
TX-AUTO-1784863220264-590	2026-07-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.264392+00
TX-AUTO-1784863220276-772	2026-07-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.275918+00
TX-AUTO-1784863220283-274	2026-07-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.283974+00
TX-AUTO-1784863220290-246	2026-07-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.289962+00
TX-AUTO-1784863220299-517	2026-07-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.299503+00
TX-AUTO-1784863220305-708	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	6.00	180.00	1367.00	246060.00	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 30 head) for Batch01_10/06/2026	2026-07-24 03:20:20.305303+00
TX-FEED-1784864694813	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_IN	500.00	15000.00	1366.67	20500050.00	Supplier	SNR Farm	TX-673823	Vannak Admin	\N	2026-07-24 03:44:55.05487+00
TX-FEED-1784864728678	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_IN	500.00	15000.00	1366.67	20500050.00	Supplier	SNR Farm	TX-723879	Vannak Admin	\N	2026-07-24 03:45:28.750981+00
TX-AUTO-1784867573587-803	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.12	3.50	1366.67	4783.35	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (3.5 kg/head/day x 1 head) for ហ្វូងបំប៉នថ្មី  Test	2026-07-24 04:32:53.587551+00
TX-AUTO-1784867573601-325	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.50	15.00	1366.67	20500.05	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-24-1	Daily Automated Feed Cron	Automated daily feed ration deduction (15 kg/head/day x 1 head) for ហ្វូងបំប៉នថ្មី  Test	2026-07-24 04:32:53.601827+00
TX-AUTO-1784867573605-824	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.07	2.00	1366.67	2733.34	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-24-2	Daily Automated Feed Cron	Automated daily feed ration deduction (2 kg/head/day x 1 head) for ហ្វូងបំប៉នថ្មី  Test	2026-07-24 04:32:53.60489+00
TX-AUTO-1784867573607-921	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.50	15.00	1366.67	20500.05	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-24-1	Daily Automated Feed Cron	Automated daily feed ration deduction (15 kg/head/day x 1 head) for ហ្វូងបំប៉នថ្មី  Test	2026-07-24 04:32:53.606428+00
TX-AUTO-1784867573616-373	2026-07-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.07	2.00	1366.67	2733.34	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-24-2	Daily Automated Feed Cron	Automated daily feed ration deduction (2 kg/head/day x 1 head) for ហ្វូងបំប៉នថ្មី  Test	2026-07-24 04:32:53.616203+00
TX-AUTO-1785735005986-579	2026-07-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:05.985678+00
TX-AUTO-1785735005995-537	2026-07-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:05.994869+00
TX-AUTO-1785735005999-631	2026-07-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:05.99831+00
TX-AUTO-1785735006003-817	2026-07-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:06.003871+00
TX-AUTO-1785735006009-617	2026-07-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:06.009397+00
TX-AUTO-1785735006013-320	2026-07-30 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-30-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:06.012672+00
TX-AUTO-1785735006017-256	2026-07-31 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-07-31-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:06.015844+00
TX-AUTO-1785735006020-771	2026-08-01 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-01-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:06.019263+00
TX-AUTO-1785735006023-617	2026-08-02 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-02-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:06.022352+00
TX-AUTO-1785735006026-377	2026-08-03 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-03-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-03 05:30:06.025359+00
TX-AUTO-1785735006029-982	2026-07-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.028435+00
TX-AUTO-1785735006033-186	2026-07-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.032894+00
TX-AUTO-1785735006044-113	2026-07-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.060761+00
TX-AUTO-1785735006066-740	2026-07-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.065767+00
TX-AUTO-1785735006075-689	2026-07-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.075201+00
TX-AUTO-1785735006081-323	2026-07-30 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-30-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.081759+00
TX-AUTO-1785735006086-502	2026-07-31 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-07-31-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.085077+00
TX-AUTO-1785735006089-791	2026-08-01 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-01-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.088638+00
TX-AUTO-1785735006092-6	2026-08-02 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-02-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.091235+00
TX-AUTO-1785735006097-756	2026-08-03 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-03-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-03 05:30:06.096116+00
TX-AUTO-1785919577452-70	2026-08-04 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-04-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-05 08:46:17.452314+00
TX-AUTO-1785919577463-839	2026-08-05 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-05-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-05 08:46:17.462545+00
TX-AUTO-1785919577470-594	2026-08-04 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-04-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-05 08:46:17.471365+00
TX-AUTO-1785919577476-419	2026-08-05 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-05-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-05 08:46:17.476039+00
TX-AUTO-1786790097432-700	2026-08-06 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-06-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.431475+00
TX-AUTO-1786790097436-162	2026-08-07 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-07-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.435279+00
TX-AUTO-1786790097438-513	2026-08-08 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-08-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.437729+00
TX-AUTO-1786790097441-433	2026-08-09 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-09-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.440276+00
TX-AUTO-1786790097443-650	2026-08-10 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-10-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.442658+00
TX-AUTO-1786790097446-258	2026-08-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.445025+00
TX-AUTO-1786790097449-331	2026-08-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.44831+00
TX-AUTO-1786790097452-728	2026-08-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.451432+00
TX-AUTO-1786790097455-893	2026-08-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.454255+00
TX-AUTO-1786790097458-170	2026-08-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-15 10:34:57.457416+00
TX-AUTO-1786790097461-247	2026-08-06 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-06-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.460972+00
TX-AUTO-1786790097465-630	2026-08-07 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-07-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.46473+00
TX-AUTO-1786790097468-741	2026-08-08 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-08-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.467482+00
TX-AUTO-1786790097472-653	2026-08-09 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-09-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.471654+00
TX-AUTO-1786790097475-991	2026-08-10 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-10-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.474364+00
TX-AUTO-1786790097478-580	2026-08-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.477506+00
TX-AUTO-1786790097481-844	2026-08-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.481319+00
TX-AUTO-1786790097485-448	2026-08-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.484802+00
TX-AUTO-1786790097488-291	2026-08-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.487824+00
TX-AUTO-1786790097492-746	2026-08-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-15 10:34:57.491601+00
TX-AUTO-1787109183555-152	2026-08-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-19 03:13:03.549107+00
TX-AUTO-1787109183561-790	2026-08-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-19 03:13:03.555171+00
TX-AUTO-1787109183564-654	2026-08-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-19 03:13:03.558518+00
TX-AUTO-1787109183571-937	2026-08-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-19 03:13:03.565061+00
TX-AUTO-1787109183578-956	2026-08-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-19 03:13:03.572739+00
TX-AUTO-1787109183583-721	2026-08-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-19 03:13:03.576845+00
TX-AUTO-1787109183586-469	2026-08-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-19 03:13:03.580072+00
TX-AUTO-1787109183589-452	2026-08-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-19 03:13:03.582871+00
TX-AUTO-1787187507206-405	2026-08-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-20 00:58:27.211022+00
TX-AUTO-1787187507241-905	2026-08-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-20 00:58:27.238827+00
TX-AUTO-1787272115591-181	2026-08-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-08-21 00:16:09.769746+00
TX-AUTO-1787272115631-953	2026-08-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-08-21 00:16:09.791165+00
TX-AUTO-1788229783992-829	2026-08-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:43.993301+00
TX-AUTO-1788229784003-570	2026-08-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.003404+00
TX-AUTO-1788229784006-744	2026-08-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.006211+00
TX-AUTO-1788229784009-191	2026-08-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.008782+00
TX-AUTO-1788229784011-445	2026-08-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.011081+00
TX-AUTO-1788229784013-802	2026-08-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.013513+00
TX-AUTO-1788229784016-321	2026-08-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.016408+00
TX-AUTO-1788229784019-947	2026-08-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.019665+00
TX-AUTO-1788229784023-124	2026-08-30 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-30-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.023435+00
TX-AUTO-1788229784026-27	2026-08-31 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-08-31-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.026576+00
TX-AUTO-1788229784029-199	2026-09-01 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-01-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-01 02:29:44.029793+00
TX-AUTO-1788229784032-94	2026-08-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.032903+00
TX-AUTO-1788229784036-141	2026-08-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.036469+00
TX-AUTO-1788229784039-911	2026-08-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.039512+00
TX-AUTO-1788229784043-537	2026-08-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.043117+00
TX-AUTO-1788229784046-875	2026-08-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.045925+00
TX-AUTO-1788229784049-53	2026-08-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.049115+00
TX-AUTO-1788229784054-905	2026-08-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.053872+00
TX-AUTO-1788229784057-222	2026-08-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.057161+00
TX-AUTO-1788229784060-245	2026-08-30 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-30-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.060434+00
TX-AUTO-1788229784064-603	2026-08-31 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-08-31-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.064283+00
TX-AUTO-1788229784067-360	2026-09-01 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-01-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-01 02:29:44.068482+00
TX-AUTO-1788314383460-304	2026-09-02 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-02-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-02 01:59:43.462084+00
TX-AUTO-1788314383484-751	2026-09-02 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-02-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-02 01:59:43.483264+00
TX-AUTO-1788417374195-766	2026-09-03 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-03-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-03 06:36:14.194408+00
TX-AUTO-1788417374205-661	2026-09-03 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-03-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-03 06:36:14.203528+00
TX-AUTO-1788506548615-521	2026-09-04 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-04-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-04 07:22:28.614853+00
TX-AUTO-1788506548635-525	2026-09-04 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-04-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-04 07:22:28.634241+00
TX-AUTO-1788769074062-548	2026-09-05 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-05-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-07 08:17:54.055195+00
TX-AUTO-1788769074097-617	2026-09-06 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-06-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-07 08:17:54.090211+00
TX-AUTO-1788769074101-620	2026-09-07 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-07-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-07 08:17:54.093023+00
TX-AUTO-1788769074104-614	2026-09-05 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-05-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-07 08:17:54.097349+00
TX-AUTO-1788769074106-956	2026-09-06 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-06-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-07 08:17:54.098743+00
TX-AUTO-1788769074108-244	2026-09-07 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-07-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-07 08:17:54.099876+00
TX-AUTO-1790659723661-400	2026-09-08 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-08-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.659451+00
TX-AUTO-1790659723668-660	2026-09-09 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-09-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.665498+00
TX-AUTO-1790659723670-463	2026-09-10 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-10-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.668064+00
TX-AUTO-1790659723672-489	2026-09-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.669402+00
TX-AUTO-1790659723672-730	2026-09-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.669984+00
TX-AUTO-1790659723675-318	2026-09-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.672423+00
TX-AUTO-1790659723675-843	2026-09-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.673026+00
TX-AUTO-1790659723677-302	2026-09-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.674277+00
TX-AUTO-1790659723677-274	2026-09-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.674884+00
TX-AUTO-1790659723678-737	2026-09-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.675469+00
TX-AUTO-1790659723679-341	2026-09-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.676175+00
TX-AUTO-1790659723679-626	2026-09-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.676767+00
TX-AUTO-1790659723680-473	2026-09-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.677646+00
TX-AUTO-1790659723681-175	2026-09-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.67843+00
TX-AUTO-1790659723681-640	2026-09-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.679133+00
TX-AUTO-1790659723682-774	2026-09-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.679916+00
TX-AUTO-1790659723683-857	2026-09-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.680655+00
TX-AUTO-1790659723684-859	2026-09-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.681307+00
TX-AUTO-1790659723684-223	2026-09-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.681983+00
TX-AUTO-1790659723685-153	2026-09-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.682622+00
TX-AUTO-1790659723687-592	2026-09-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.684457+00
TX-AUTO-1790659723687-786	2026-09-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	0.70	21.00	1366.67	28700.07	SNR Farm	Daily Feed Ration (ហ្វូងបំប៉នថ្មី  Test)	AUTO-RATION-BAT-2026-590-2026-09-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (7 kg/head/day x 3 head) for ហ្វូងបំប៉នថ្មី  Test	2026-09-29 05:28:43.685126+00
TX-AUTO-1790659723689-416	2026-09-08 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-08-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.687112+00
TX-AUTO-1790659723690-980	2026-09-09 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-09-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.687969+00
TX-AUTO-1790659723691-166	2026-09-10 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-10-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.688665+00
TX-AUTO-1790659723692-266	2026-09-11 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-11-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.689974+00
TX-AUTO-1790659723694-764	2026-09-12 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-12-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.692136+00
TX-AUTO-1790659723696-628	2026-09-13 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-13-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.693336+00
TX-AUTO-1790659723697-403	2026-09-14 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-14-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.69432+00
TX-AUTO-1790659723697-487	2026-09-15 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-15-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.695149+00
TX-AUTO-1790659723698-992	2026-09-16 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-16-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.696137+00
TX-AUTO-1790659723700-466	2026-09-17 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-17-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.697495+00
TX-AUTO-1790659723701-721	2026-09-18 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-18-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.698345+00
TX-AUTO-1790659723702-805	2026-09-19 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-19-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.699186+00
TX-AUTO-1790659723702-732	2026-09-20 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-20-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.69988+00
TX-AUTO-1790659723703-926	2026-09-21 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-21-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.700927+00
TX-AUTO-1790659723706-500	2026-09-22 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-22-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.70531+00
TX-AUTO-1790659723710-684	2026-09-23 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-23-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.708687+00
TX-AUTO-1790659723712-302	2026-09-24 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-24-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.709836+00
TX-AUTO-1790659723713-755	2026-09-25 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-25-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.711445+00
TX-AUTO-1790659723715-786	2026-09-26 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-26-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.712797+00
TX-AUTO-1790659723716-859	2026-09-27 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-27-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.714172+00
TX-AUTO-1790659723718-864	2026-09-28 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-28-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.715525+00
TX-AUTO-1790659723719-705	2026-09-29 00:00:00+00	PROD-F01	DSR-16 Cow Feed	STOCK_OUT	5.40	162.00	1366.67	221400.54	SNR Farm	Daily Feed Ration (Batch01_10/06/2026)	AUTO-RATION-FAT-2026-961-2026-09-29-0	Daily Automated Feed Cron	Automated daily feed ration deduction (6 kg/head/day x 27 head) for Batch01_10/06/2026	2026-09-29 05:28:43.7171+00
\.


--
-- Data for Name: health_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health_logs (id, cow_id, type, name, date, administered_by, cost, notes, created_at) FROM stdin;
\.


--
-- Data for Name: master_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.master_settings (id, key, data, updated_at) FROM stdin;
4	master_setup	{"farms": [{"id": "FARM-01", "name": "SNR Farm", "notes": "ទីតាំងបំប៉នសាច់ និងផលិតចំណី", "address": "ភូមិរទាំង ឃុំភូមិធំ ស្រុកកៀនស្វាយ ខេត្តកណ្តាល", "ownerId": "4", "capacity": 100, "ownerName": "Vannak", "ownerEmail": "hello@gmail.com"}], "roles": [{"id": "ROLE-01", "name": "Super Admin", "isSystem": true, "description": "Full system management and security authority.", "permissions": ["dashboard_view", "stock_view", "stock_create", "stock_edit", "stock_delete", "batch_view", "batch_create", "batch_edit", "batch_delete", "weight_view", "weight_record", "weight_delete", "health_view", "health_record", "health_delete", "sales_view", "sales_record", "sales_delete", "expenses_view", "expenses_record", "expenses_delete", "analytics_view", "settings_manage"]}], "sexes": ["Male", "Female"], "users": [{"id": "1", "name": "Vannak", "role": "Super Admin", "email": "vannak@snrfarm.com", "status": "Active", "permissions": ["dashboard_view", "stock_view", "stock_create", "stock_edit", "stock_delete", "batch_view", "batch_create", "batch_edit", "batch_delete", "weight_view", "weight_record", "weight_delete", "health_view", "health_record", "health_delete", "sales_view", "sales_record", "sales_delete", "expenses_view", "expenses_record", "expenses_delete", "analytics_view", "feed_view", "feed_manage", "settings_manage", "farms_manage"]}], "breeds": ["គោទន្លេ", "កាត់ Brahman", "កាត់ Wagyu"], "buyTypes": ["Lumsum", "Weight", "Born in Farm", "Transfer", "Partnership"], "feedTypes": ["Fresh Grass", "MTR Feed"], "locations": ["SNR Farm"], "batchTypes": ["Fattening Program", "Quanrantin & Vet Card", "Selling Pool"], "weightUnits": ["kg", "lbs"], "diseaseTypes": ["Foot and Mouth Disease (FMD)", "Brucellosis", "Anthrax", "Pneumonia", "Parasite Infection"], "revenueTypes": ["Livestock Sale", "Partnership Share"], "vaccineTypes": ["Foot and Mouth", "Brucellosis", "Anthrax", "Dewormer A", "Vitamin Boost"], "purchaseTypes": ["Purchase", "Born in Farm", "Transfer", "Partnership"], "healthStatuses": ["Good", "Fair", "Poor", "Dead"], "paymentMethods": ["Cash", "Bank Transfer"], "expenseCategories": ["Bank interest", "forage", "Straw", "Water-Fire", "Asset", "Salary", "Other", "Corn / grass", "Vaccines and medicines"]}	2026-09-03 10:06:46.668441+00
\.


--
-- Data for Name: proposal_plan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_plan (id, params, updated_at) FROM stdin;
\.


--
-- Data for Name: sales_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_tracking (id, cow_id, breed, age, weight, unit_price, total_price, status, sales_date, sale_type, buyer) FROM stdin;
\.


--
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock (id, no, breed, sex, age, weight, owner_name, location, phone, buy_type, unit_price, total_price, health_status, status, purchase_date, remark, purchase_type, payment_method, created_at, updated_at, image_url) FROM stdin;
CC-016	07	គោទន្លេ	Female	N/A	271.30	CamCow	SNR Farm	N/A	Weight	12000.00	2796000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 04:01:39.946+00	2026-07-23 08:22:29.497+00	\N
CC-003	08	គោទន្លេ	Female	N/A	365.30	CamCow	SNR Farm	N/A	Weight	12000.00	3924000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 04:02:39.726+00	2026-07-23 08:22:29.509+00	\N
CC-015	09	គោទន្លេ	Female	N/A	304.30	CamCow	SNR Farm	N/A	Weight	12000.00	3192000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 04:03:28.921+00	2026-07-23 08:22:29.517+00	\N
CC-021	10	គោទន្លេ	Female	N/A	312.30	CamCow	SNR Farm	N/A	Weight	12000.00	3288000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 04:04:09.42+00	2026-07-23 08:22:29.526+00	\N
CC-001	12	គោទន្លេ	Female	N/A	250.30	CamCow	SNR Farm	N/A	Weight	12000.00	2544000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 04:05:19.796+00	2026-07-23 08:22:29.535+00	\N
CC-022	13	គោទន្លេ	Female	N/A	267.30		SNR Farm		Weight	12000.00	2748000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 06:35:24.049+00	2026-07-23 08:22:29.542+00	\N
CC-029	14	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	460.00	CamCow	SNR Farm		Weight	11500.00	4772500.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:03:18.824+00	2026-07-23 08:22:29.551+00	\N
CC-025	15	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	362.30	CamCow	SNR Farm	N/A	Weight	11500.00	3726000.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:04:41.295+00	2026-07-23 08:22:29.557+00	\N
CC-039	16	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	327.30	CamCow	SNR Farm	N/A	Weight	11500.00	3323500.00	Good	Active	2026-07-23 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:05:39.293+00	2026-07-23 08:22:29.566+00	\N
CC-028	17	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	429.30	CamCow	SNR Farm	N/A	Weight	11500.00	4496500.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:06:55.887+00	2026-07-23 08:22:29.579+00	\N
CC-032	18	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	418.30	CamCow	SNR Farm	N/A	Weight	11500.00	4370000.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:07:56.762+00	2026-07-23 08:22:29.584+00	\N
CC-013	01	គោទន្លេ	Female	N/A	353.30	CamCow	SNR Farm		Weight	12000.00	3780000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 03:56:29.718+00	2026-07-23 08:22:29.425+00	\N
CC-010	02	គោទន្លេ	Female	N/A	364.30	CamCow	SNR Farm	N/A	Weight	12000.00	3912000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 03:57:17.7+00	2026-07-23 08:22:29.457+00	\N
CC-017	03	គោទន្លេ	Female	N/A	361.30	CamCow	SNR Farm	N/A	Weight	12000.00	3876000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 03:58:19.356+00	2026-07-23 08:22:29.465+00	\N
CC-012	04	គោទន្លេ	Female	N/A	371.30	CamCow	SNR Farm	N/A	Weight	12000.00	3996000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 03:59:20.993+00	2026-07-23 08:22:29.471+00	\N
CC-019	05	គោទន្លេ	Female	N/A	334.30	CamCow	SNR Farm	N/A	Weight	12000.00	3552000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 04:00:04.063+00	2026-07-23 08:22:29.478+00	\N
CC-020	06	គោទន្លេ	Female	N/A	321.30	CamCow	SNR Farm	N/A	Weight	12000.00	3396000.00	Good	Active	2026-06-10 00:00:00+00		Purchase	Bank Transfer	2026-07-23 04:00:58.648+00	2026-07-23 08:22:29.489+00	\N
CC-038	19	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	338.30	CamCow	SNR Farm	N/A	Weight	11500.00	3450000.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:09:36.653+00	2026-07-23 08:22:29.59+00	\N
CC-034	20	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	340.30	CamCow	SNR Farm	N/A	Weight	11500.00	3473000.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:10:36.578+00	2026-07-23 08:22:29.595+00	\N
CC-040	21	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	340.30	CamCow	SNR Farm	N/A	Weight	11500.00	3473000.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:11:38.795+00	2026-07-23 08:22:29.603+00	\N
CC-024	22	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	361.30	CamCow	SNR Farm	N/A	Weight	11500.00	3714500.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:12:34.862+00	2026-07-23 08:22:29.61+00	\N
CC-023	23	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	355.30	CamCow	SNR Farm	N/A	Weight	11495.00	3643915.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:13:21.441+00	2026-07-23 08:22:29.616+00	\N
CC-036	24	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	390.00	CamCow	SNR Farm	N/A	Weight	11500.00	4197500.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:14:09.571+00	2026-07-23 08:22:29.624+00	\N
CC-027	25	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	358.30	CamCow	SNR Farm	N/A	Weight	11500.00	3680000.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:15:02.405+00	2026-07-23 08:22:29.634+00	\N
CC-037	26	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	257.30	CamCow	SNR Farm	N/A	Weight	11500.00	2518500.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:15:47.256+00	2026-07-23 08:22:29.641+00	\N
CC-030	27	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	353.30	CamCow	SNR Farm	N/A	Weight	11500.00	3622500.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:16:59.854+00	2026-07-23 08:22:29.647+00	\N
CC-026	28	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	355.30	CamCow	SNR Farm	N/A	Weight	11500.00	3645500.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:17:46.442+00	2026-07-23 08:22:29.653+00	\N
CC-033	29	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	390.30	CamCow	SNR Farm	N/A	Weight	11500.00	4048000.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:18:28.583+00	2026-07-23 08:22:29.661+00	\N
CC-031	30	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	381.00	CamCow	SNR Farm	N/A	Weight	11500.00	3864000.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:19:13.575+00	2026-07-23 08:22:29.667+00	\N
CC-035	31	ប្រាម៉ាន់កាត់ទន្លេ	Female	N/A	379.30	CamCow	SNR Farm	N/A	Weight	11500.00	3921500.00	Good	Active	2026-06-11 00:00:00+00		Purchase	Bank Transfer	2026-07-23 07:20:31.032+00	2026-07-23 08:22:29.673+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, role, status, password, created_at, permissions, farm_location, pin_hash) FROM stdin;
1	Vannak	vannak@snrfarm.com	Super Admin	Active	$2b$10$IDRmF9SZS0xMM/AASZ9D1eFrfZncnUU9CHeePtA0FvZ0Gc1c18LMq	2026-07-23 03:03:45.619121+00	["dashboard_view", "stock_view", "stock_create", "stock_edit", "stock_delete", "batch_view", "batch_create", "batch_edit", "batch_delete", "weight_view", "weight_record", "weight_delete", "health_view", "health_record", "health_delete", "sales_view", "sales_record", "sales_delete", "expenses_view", "expenses_record", "expenses_delete", "analytics_view", "feed_view", "feed_manage", "settings_manage", "farms_manage"]	\N	\N
\.


--
-- Data for Name: weight_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weight_tracking (id, cow_id, breed, age, old_weight, current_weight, gain_loss, health_status, status, tracking_date) FROM stdin;
122	CC-013	គោទន្លេ	N/A	0.00	315.00	0.0000	Good	Active	2026-06-10 00:00:00+00
123	CC-010	គោទន្លេ	N/A	0.00	326.00	0.0000	Good	Active	2026-06-10 00:00:00+00
124	CC-017	គោទន្លេ	N/A	0.00	323.00	0.0000	Good	Active	2026-06-10 00:00:00+00
125	CC-012	គោទន្លេ	N/A	0.00	333.00	0.0000	Good	Active	2026-06-10 00:00:00+00
126	CC-019	គោទន្លេ	N/A	0.00	296.00	0.0000	Good	Active	2026-06-10 00:00:00+00
127	CC-020	គោទន្លេ	N/A	0.00	283.00	0.0000	Good	Active	2026-06-10 00:00:00+00
128	CC-016	គោទន្លេ	N/A	0.00	233.00	0.0000	Good	Active	2026-06-10 00:00:00+00
129	CC-003	គោទន្លេ	N/A	0.00	327.00	0.0000	Good	Active	2026-06-10 00:00:00+00
130	CC-015	គោទន្លេ	N/A	0.00	266.00	0.0000	Good	Active	2026-06-10 00:00:00+00
131	CC-021	គោទន្លេ	N/A	0.00	274.00	0.0000	Good	Active	2026-06-10 00:00:00+00
132	CC-001	គោទន្លេ	N/A	0.00	212.00	0.0000	Good	Active	2026-06-10 00:00:00+00
133	CC-022	គោទន្លេ	N/A	0.00	229.00	0.0000	Good	Active	2026-06-10 00:00:00+00
134	CC-029	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	415.00	0.0000	Good	Active	2026-06-11 00:00:00+00
135	CC-025	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	324.00	0.0000	Good	Active	2026-06-11 00:00:00+00
136	CC-039	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	289.00	0.0000	Good	Active	2026-07-23 00:00:00+00
137	CC-028	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	391.00	0.0000	Good	Active	2026-06-11 00:00:00+00
138	CC-032	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	380.00	0.0000	Good	Active	2026-06-11 00:00:00+00
139	CC-038	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	300.00	0.0000	Good	Active	2026-06-11 00:00:00+00
140	CC-034	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	302.00	0.0000	Good	Active	2026-06-11 00:00:00+00
141	CC-040	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	302.00	0.0000	Good	Active	2026-06-11 00:00:00+00
142	CC-024	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	323.00	0.0000	Good	Active	2026-06-11 00:00:00+00
143	CC-023	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	317.00	0.0000	Good	Active	2026-06-11 00:00:00+00
144	CC-036	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	365.00	0.0000	Good	Active	2026-06-11 00:00:00+00
145	CC-027	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	320.00	0.0000	Good	Active	2026-06-11 00:00:00+00
146	CC-037	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	219.00	0.0000	Good	Active	2026-06-11 00:00:00+00
147	CC-030	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	315.00	0.0000	Good	Active	2026-06-11 00:00:00+00
148	CC-026	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	317.00	0.0000	Good	Active	2026-06-11 00:00:00+00
149	CC-033	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	352.00	0.0000	Good	Active	2026-06-11 00:00:00+00
150	CC-031	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	336.00	0.0000	Good	Active	2026-06-11 00:00:00+00
151	CC-035	ប្រាម៉ាន់កាត់ទន្លេ	N/A	0.00	341.00	0.0000	Good	Active	2026-06-11 00:00:00+00
152	CC-013	គោទន្លេ	N/A	315.00	353.30	0.1216	Good	Active	2026-07-23 00:00:00+00
153	CC-010	គោទន្លេ	N/A	326.00	364.30	0.1175	Good	Active	2026-07-23 00:00:00+00
154	CC-017	គោទន្លេ	N/A	323.00	361.30	0.1186	Good	Active	2026-07-23 00:00:00+00
155	CC-012	គោទន្លេ	N/A	333.00	371.30	0.1150	Good	Active	2026-07-23 00:00:00+00
156	CC-019	គោទន្លេ	N/A	296.00	334.30	0.1294	Good	Active	2026-07-23 00:00:00+00
157	CC-020	គោទន្លេ	N/A	283.00	321.30	0.1353	Good	Active	2026-07-23 00:00:00+00
158	CC-016	គោទន្លេ	N/A	233.00	271.30	0.1644	Good	Active	2026-07-23 00:00:00+00
159	CC-003	គោទន្លេ	N/A	327.00	365.30	0.1171	Good	Active	2026-07-23 00:00:00+00
160	CC-015	គោទន្លេ	N/A	266.00	304.30	0.1440	Good	Active	2026-07-23 00:00:00+00
161	CC-021	គោទន្លេ	N/A	274.00	312.30	0.1398	Good	Active	2026-07-23 00:00:00+00
162	CC-001	គោទន្លេ	N/A	212.00	250.30	0.1807	Good	Active	2026-07-23 00:00:00+00
163	CC-022	គោទន្លេ	N/A	229.00	267.30	0.1672	Good	Active	2026-07-23 00:00:00+00
164	CC-029	ប្រាម៉ាន់កាត់ទន្លេ	N/A	415.00	460.00	0.1084	Good	Active	2026-07-23 00:00:00+00
165	CC-025	ប្រាម៉ាន់កាត់ទន្លេ	N/A	324.00	362.30	0.1182	Good	Active	2026-07-23 00:00:00+00
166	CC-039	ប្រាម៉ាន់កាត់ទន្លេ	N/A	289.00	327.30	0.1325	Good	Active	2026-07-23 00:00:00+00
167	CC-028	ប្រាម៉ាន់កាត់ទន្លេ	N/A	391.00	429.30	0.0980	Good	Active	2026-07-23 00:00:00+00
168	CC-032	ប្រាម៉ាន់កាត់ទន្លេ	N/A	380.00	418.30	0.1008	Good	Active	2026-07-23 00:00:00+00
169	CC-038	ប្រាម៉ាន់កាត់ទន្លេ	N/A	300.00	338.30	0.1277	Good	Active	2026-07-23 00:00:00+00
170	CC-034	ប្រាម៉ាន់កាត់ទន្លេ	N/A	302.00	340.30	0.1268	Good	Active	2026-07-23 00:00:00+00
171	CC-040	ប្រាម៉ាន់កាត់ទន្លេ	N/A	302.00	340.30	0.1268	Good	Active	2026-07-23 00:00:00+00
172	CC-024	ប្រាម៉ាន់កាត់ទន្លេ	N/A	323.00	361.30	0.1186	Good	Active	2026-07-23 00:00:00+00
173	CC-023	ប្រាម៉ាន់កាត់ទន្លេ	N/A	317.00	355.30	0.1208	Good	Active	2026-07-23 00:00:00+00
174	CC-036	ប្រាម៉ាន់កាត់ទន្លេ	N/A	365.00	390.00	0.0685	Good	Active	2026-07-23 00:00:00+00
175	CC-027	ប្រាម៉ាន់កាត់ទន្លេ	N/A	320.00	358.30	0.1197	Good	Active	2026-07-23 00:00:00+00
176	CC-037	ប្រាម៉ាន់កាត់ទន្លេ	N/A	219.00	257.30	0.1749	Good	Active	2026-07-23 00:00:00+00
177	CC-030	ប្រាម៉ាន់កាត់ទន្លេ	N/A	315.00	353.30	0.1216	Good	Active	2026-07-23 00:00:00+00
178	CC-026	ប្រាម៉ាន់កាត់ទន្លេ	N/A	317.00	355.30	0.1208	Good	Active	2026-07-23 00:00:00+00
179	CC-033	ប្រាម៉ាន់កាត់ទន្លេ	N/A	352.00	390.30	0.1088	Good	Active	2026-07-23 00:00:00+00
180	CC-031	ប្រាម៉ាន់កាត់ទន្លេ	N/A	336.00	381.00	0.1339	Good	Active	2026-07-23 00:00:00+00
181	CC-035	ប្រាម៉ាន់កាត់ទន្លេ	N/A	341.00	379.30	0.1123	Good	Active	2026-07-23 00:00:00+00
\.


--
-- Name: master_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.master_settings_id_seq', 54, true);


--
-- Name: sales_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_tracking_id_seq', 1, false);


--
-- Name: weight_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weight_tracking_id_seq', 181, true);


--
-- Name: batch_cows batch_cows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_cows
    ADD CONSTRAINT batch_cows_pkey PRIMARY KEY (batch_id, cow_id);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: feed_products feed_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feed_products
    ADD CONSTRAINT feed_products_pkey PRIMARY KEY (id);


--
-- Name: feed_transactions feed_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feed_transactions
    ADD CONSTRAINT feed_transactions_pkey PRIMARY KEY (id);


--
-- Name: health_logs health_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_logs
    ADD CONSTRAINT health_logs_pkey PRIMARY KEY (id);


--
-- Name: master_settings master_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_settings
    ADD CONSTRAINT master_settings_key_key UNIQUE (key);


--
-- Name: master_settings master_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_settings
    ADD CONSTRAINT master_settings_pkey PRIMARY KEY (id);


--
-- Name: proposal_plan proposal_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_plan
    ADD CONSTRAINT proposal_plan_pkey PRIMARY KEY (id);


--
-- Name: sales_tracking sales_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_tracking
    ADD CONSTRAINT sales_tracking_pkey PRIMARY KEY (id);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weight_tracking weight_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_tracking
    ADD CONSTRAINT weight_tracking_pkey PRIMARY KEY (id);


--
-- Name: idx_batch_cows_cow_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_batch_cows_cow_id ON public.batch_cows USING btree (cow_id);


--
-- Name: idx_expenses_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);


--
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- Name: idx_health_cow_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_health_cow_id ON public.health_logs USING btree (cow_id);


--
-- Name: idx_sales_cow_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_cow_id ON public.sales_tracking USING btree (cow_id);


--
-- Name: idx_stock_health; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_health ON public.stock USING btree (health_status);


--
-- Name: idx_stock_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_status ON public.stock USING btree (status);


--
-- Name: idx_weight_cow_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_weight_cow_id ON public.weight_tracking USING btree (cow_id);


--
-- Name: idx_weight_tracking_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_weight_tracking_date ON public.weight_tracking USING btree (tracking_date);


--
-- Name: batch_cows batch_cows_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_cows
    ADD CONSTRAINT batch_cows_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;


--
-- Name: batch_cows batch_cows_cow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_cows
    ADD CONSTRAINT batch_cows_cow_id_fkey FOREIGN KEY (cow_id) REFERENCES public.stock(id) ON DELETE CASCADE;


--
-- Name: health_logs health_logs_cow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_logs
    ADD CONSTRAINT health_logs_cow_id_fkey FOREIGN KEY (cow_id) REFERENCES public.stock(id) ON DELETE CASCADE;


--
-- Name: sales_tracking sales_tracking_cow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_tracking
    ADD CONSTRAINT sales_tracking_cow_id_fkey FOREIGN KEY (cow_id) REFERENCES public.stock(id) ON DELETE CASCADE;


--
-- Name: weight_tracking weight_tracking_cow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_tracking
    ADD CONSTRAINT weight_tracking_cow_id_fkey FOREIGN KEY (cow_id) REFERENCES public.stock(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2vjREVukQIuqmFIDhPic2iwNOqwlMf39zP10RgMahqNNG69KN3O0rXAnD1MbmYU

