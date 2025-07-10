const getTopics = (stream, subject, standard) => {
    if (!stream || !subject || !standard) {
        return {}
    }

    return data?.[stream]?.[subject]?.[standard] || {};
};

const data = {
    JEE: {
        Physics: {
            "11": {
                "Physical World and Measurement": "1",
                "Units and Measurements": "2",
                "Motion in a Straight Line": "3",
                "Motion in a Plane": "4",
                "Laws of Motion": "5",
                "Work, Energy and Power": "6",
                "System of Particles": "7",
                "Gravitation": "8",
                "Mechanical Properties of Solids": "9",
                "Ray Optics and Optical Instruments": "10",
                "Thermal Properties of Matter": "11",
                "Thermodynamics": "12",
                "Kinetic Theory of Gases": "13",
                "Oscillations": "14",
                "Waves": "15",
                "Circular Motion": "16",
                "Rotational Motion": "17"
            },
            "12": {
                "Electric Charges and Fields": "18",
                "Electrostatic Potential and Capacitance": "19",
                "Current Electricity": "20",
                "Moving Charges and Magnetism": "21",
                "Magnetism and Matter": "22",
                "Electromagnetic Induction": "23",
                "Alternating Current": "24",
                "Electromagnetic Waves": "25",
                "Mechanical Properties of Fluids": "26",
                "Wave Optics": "27",
                "Dual Nature of Radiation and Matter": "28",
                "Atoms": "29",
                "Nuclei": "30",
                "Semiconductor Electronics: Material, Devices and Simple Circuits": "31",
                "Communication System": "32"
            }
        },
        Chemistry: {
            "11": {
                "Some Basic Concepts of Chemistry": "33",
                "Atomic Structure": "34",
                "Periodic Table & Periodicity": "35",
                "Chemical Bonding & Molecular Structure": "36",
                "States of Matter": "37",
                "Redox Reaction": "38",
                "Chemical Thermodynamics": "39",
                "Chemical Equilibrium": "40",
                "Ionic Equilibrium": "41",
                "S-Block( alkali and alkaline metals )": "42",
                "P-Block elements ( Gr 13 & Gr 14 )": "43",
                "General Organic Chemistry IUPAC & Nomenclature": "44",
                "Hydrocarbon": "45",
                "Principles Related to Practical Chemistry": "46"
            },
            "12": {
                "Halogen Derivatives": "47",
                "Alcohol, Phenol and Ether": "48",
                "Aldehydes Ketones and Acids": "49",
                "Amines": "50",
                "Solid State": "51",
                "Solution": "52",
                "Electrochemistry": "53",
                "Chemical Kinetics": "54",
                "Co-ordination Chemistry": "55",
                "Surface Chemistry": "56",
                "General Principles and Processes of Isolation of Elements": "57",
                "P-Block elements ( Group 15 & 16 )": "58",
                "P-Block elements ( Group 17 & 18 )": "59",
                "D & F Block": "60",
                "Practical Organic Chemistry": "61",
                "Biomolecules": "62",
                "Polymer": "63"
            }
        },
        Maths: {
            "11": {
                "Basic Mathematics": "64",
                "Logarithm": "65",
                "Quadratic Equation": "66",
                "Trigonometric Ratios and Identities": "67",
                "Sequence and Progression": "68",
                "Trigonometric equation": "69",
                "Solution of Triangle": "70",
                "Determinant": "71",
                "Straight line": "72",
                "Circle": "73",
                "Parabola": "74",
                "Ellipse": "75",
                "Hyperbola": "76",
                "Binomial Theorem": "77",
                "Permutation and Combination": "78",
                "Set & Relation": "79",
                "Function": "80"
            },
            "12": {
                "Inverse Trigonometric Functions": "81",
                "Limit": "82",
                "Continuity": "83",
                "Derivability": "84",
                "Method of Differentiation": "85",
                "Indefinite Integration": "86",
                "Definite Integration": "87",
                "Application of Derivatives": "88",
                "Area under the Curve": "89",
                "Differential Equations": "90",
                "Vector": "91",
                "Three Dimensional Geometry": "92",
                "Complex Numbers": "93",
                "Probability": "94",
                "Mathematical logic": "95",
                "Matrices": "96",
                "Statistics": "97"
            }
        },
        Botany: {
            "11": {
                "Living World": "98",
                "Biological Classification": "99",
                "Plant Kingdom": "100",
                "Morphology of Flowering Plants": "101",
                "Anatomy of Flowering Plants": "102",
                "Cell: The unit of life": "103",
                "Cell Cycle and Cell Division": "104",
                "Photosynthesis in Higher Plants": "105",
                "Respiration in Plants": "106",
                "Plant Growth and Development": "107"
            },
            "12": {
                "Sexual Reproduction in Flowering Plants": "108",
                "Principles of Inheritance and Variation": "109",
                "Molecular Basis of Inheritance": "110",
                "Biotechnology: Principles and Processes": "111",
                "Organisms and Populations": "112",
                "Ecosystem": "113",
                "Biodiversity and Conservation": "114",
                "Transport in Plants & Mineral Nutrition": "115",
                "Strategies of Enhancement in Food Production": "116",
                "Environmental Issues": "117"
            }
        },
        Zoology: {
            "11": {
                "Animal Kingdom": "118",
                "Structural Organisation in Animals": "119",
                "Biomolecules": "120",
                "Breathing and Exchange of Gases": "121",
                "Body Fluids and Circulation": "122",
                "Excretory Products and Their Elimination": "123",
                "Locomotion and Movement": "124",
                "Neural control and co-ordination": "125",
                "Chemical co-ordination and Integration": "126"
            },
            "12": {
                "Human Reproduction": "127",
                "Reproductive Health": "128",
                "Evolution": "129",
                "Human Health and Disease": "130",
                "Microbes in Human Welfare": "131",
                "Biotechnology and Its Applications": "132"
            }
        }
    },
    NEET: {
        Physics: {
            "11": {
                "Physical World and Measurement": "133",
                "Units and Measurements": "134",
                "Motion in a Straight Line": "135",
                "Motion in a Plane": "136",
                "Laws of Motion": "137",
                "Work, Energy and Power": "138",
                "System of Particles": "139",
                "Gravitation": "140",
                "Mechanical Properties of Solids": "141",
                "Ray Optics and Optical Instruments": "142",
                "Thermal Properties of Matter": "143",
                "Thermodynamics": "144",
                "Kinetic Theory of Gases": "145",
                "Oscillations": "146",
                "Waves": "147",
                "Circular Motion": "148",
                "Rotational Motion": "149"
            },
            "12": {
                "Electric Charges and Fields": "150",
                "Electrostatic Potential and Capacitance": "151",
                "Current Electricity": "152",
                "Moving Charges and Magnetism": "153",
                "Magnetism and Matter": "154",
                "Electromagnetic Induction": "155",
                "Alternating Current": "156",
                "Electromagnetic Waves": "157",
                "Mechanical Properties of Fluids": "158",
                "Wave Optics": "159",
                "Dual Nature of Radiation and Matter": "160",
                "Atoms": "161",
                "Nuclei": "162",
                "Semiconductor Electronics: Material, Devices and Simple Circuits": "163",
                "Communication System": "164"
            }
        },
        Chemistry: {
            "11": {
                "Some Basic Concepts of Chemistry": "165",
                "Atomic Structure": "166",
                "Periodic Table & Periodicity": "167",
                "Chemical Bonding & Molecular Structure": "168",
                "States of Matter": "169",
                "Redox Reaction": "170",
                "Chemical Thermodynamics": "171",
                "Chemical Equilibrium": "172",
                "Ionic Equilibrium": "173",
                "S-Block( alkali and alkaline metals )": "174",
                "P-Block elements ( Gr 13 & Gr 14 )": "175",
                "General Organic Chemistry IUPAC & Nomenclature": "176",
                "Hydrocarbon": "177",
                "Principles Related to Practical Chemistry": "178"
            },
            "12": {
                "Halogen Derivatives": "179",
                "Alcohol, Phenol and Ether": "180",
                "Aldehydes Ketones and Acids": "181",
                "Amines": "182",
                "Solid State": "183",
                "Solution": "184",
                "Electrochemistry": "185",
                "Chemical Kinetics": "186",
                "Co-ordination Chemistry": "187",
                "Surface Chemistry": "188",
                "General Principles and Processes of Isolation of Elements": "189",
                "P-Block elements ( Group 15 & 16 )": "190",
                "P-Block elements ( Group 17 & 18 )": "191",
                "D & F Block": "192",
                "Practical Organic Chemistry": "193",
                "Biomolecules": "194",
                "Polymer": "195"
            }
        },
        Maths: {
            "11": {
                "Basic Mathematics": "196",
                "Logarithm": "197",
                "Quadratic Equation": "198",
                "Trigonometric Ratios and Identities": "199",
                "Sequence and Progression": "200",
                "Trigonometric equation": "201",
                "Solution of Triangle": "202",
                "Determinant": "203",
                "Straight line": "204",
                "Circle": "205",
                "Parabola": "206",
                "Ellipse": "207",
                "Hyperbola": "208",
                "Binomial Theorem": "209",
                "Permutation and Combination": "210",
                "Set & Relation": "211",
                "Function": "212"
            },
            "12": {
                "Inverse Trigonometric Functions": "213",
                "Limit": "214",
                "Continuity": "215",
                "Derivability": "216",
                "Method of Differentiation": "217",
                "Indefinite Integration": "218",
                "Definite Integration": "219",
                "Application of Derivatives": "220",
                "Area under the Curve": "221",
                "Differential Equations": "222",
                "Vector": "223",
                "Three Dimensional Geometry": "224",
                "Complex Numbers": "225",
                "Probability": "226",
                "Mathematical logic": "227",
                "Matrices": "228",
                "Statistics": "229"
            }
        },
        Biology: {
            "11": {
                "Living World": "230",
                "Biological Classification": "231",
                "Plant Kingdom": "232",
                "Morphology of Flowering Plants": "233",
                "Anatomy of Flowering Plants": "234",
                "Cell: The unit of life": "235",
                "Cell Cycle and Cell Division": "236",
                "Photosynthesis in Higher Plants": "237",
                "Respiration in Plants": "238",
                "Plant Growth and Development": "239",
                "Animal Kingdom": "250",
                "Structural Organisation in Animals": "251",
                "Biomolecules": "252",
                "Breathing and Exchange of Gases": "253",
                "Body Fluids and Circulation": "254",
                "Excretory Products and Their Elimination": "255",
                "Locomotion and Movement": "256",
                "Neural control and co-ordination": "257",
                "Chemical co-ordination and Integration": "258"
            },
            "12": {
                "Sexual Reproduction in Flowering Plants": "240",
                "Principles of Inheritance and Variation": "241",
                "Molecular Basis of Inheritance": "242",
                "Biotechnology: Principles and Processes": "243",
                "Organisms and Populations": "244",
                "Ecosystem": "245",
                "Biodiversity and Conservation": "246",
                "Transport in Plants & Mineral Nutrition": "247",
                "Strategies of Enhancement in Food Production": "248",
                "Environmental Issues": "249",
                "Human Reproduction": "259",
                "Reproductive Health": "260",
                "Evolution": "261",
                "Human Health and Disease": "262",
                "Microbes in Human Welfare": "263",
                "Biotechnology and Its Applications": "264"
            }
        }
    },
    "MHT-CET": {
        Physics: {
            "11": {
                "Motion in a Plane": "265",
                "Laws of Motion": "266",
                "Gravitation": "267",
                "Thermal Properties of Matter": "268",
                "Sound": "269",
                "Optics": "270",
                "Electrostatics": "271",
                "Semiconductors": "272"
            },
            "12": {
                "Rotational Dynamics": "273",
                "Mechanical Properties of Fluids": "274",
                "Kinetic Theory of Gases and Radiation": "275",
                "Thermodynamics": "276",
                "Oscillations": "277",
                "Superposition of Waves": "278",
                "Wave Optics": "279",
                "Electrostatics": "280",
                "Current Electricity": "281",
                "Magnetic Fields due to Electric Current": "282",
                "Magnetic Materials": "283",
                "Electromagnetic induction": "284",
                "AC Circuits": "285",
                "Dual Nature of Radiation and Matter": "286",
                "Structure of Atoms and Nuclei": "287",
                "Semiconductor Devices": "288"
            }
        },
        Chemistry: {
            "11": {
                "Some Basic Concepts of Chemistry": "289",
                "Structure of atom": "290",
                "Chemical Bonding": "291",
                "Redox Reaction": "292",
                "Elements of group 1 and 2": "293",
                "States of Matter (Gaseous and Liquids)": "294",
                "Adsorption and colloids (Surface Chemistry)": "295",
                "Hydrocarbons": "296",
                "Basic principles of organic chemistry": "297"
            },
            "12": {
                "Solid State": "298",
                "Solutions": "299",
                "Ionic Equilibria": "300",
                "Chemical thermodynamics": "357",
                "Halogen Derivatives": "301",
                "Alcohol, Phenol and Ether": "302",
                "Aldehydes, Ketones and Carboxylic acids": "303",
                "Amines": "304",
                "Electrochemistry": "305",
                "Chemical Kinetics": "306",
                "Elements of Groups 16, 17 and 18": "307",
                "Transition and Inner transition Elements": "308",
                "Coordination Compounds": "309",
                "Biomolecules": "310",
                "Introduction to Polymer Chemistry": "311",
                "Green Chemistry and Nanochemistry": "312"
            }
        },
        Maths: {
            "11": {
                "Trigonometry II": "313",
                "Straight line": "314",
                "Circle": "315",
                "Measures of Dispersion": "316",
                "Probability": "317",
                "Complex Numbers": "318",
                "Permutation and Combination": "319",
                "Function": "320",
                "Limits": "321",
                "Continuity": "322"
            },
            "12": {
                "Mathematical logic": "323",
                "Matrices": "324",
                "Trigonometric Functions": "325",
                "Pair of Straight Lines": "326",
                "Vectors": "327",
                "Line and Plane": "328",
                "Linear Programming": "329",
                "Differentiation": "330",
                "Applications of Derivatives": "331",
                "Indefinite Integration": "332",
                "Definite Integration": "333",
                "Application of Definite Integration": "334",
                "Differential Equations": "335",
                "Probability Distributions": "336",
                "Binomial Distribution": "337"
            }
        },
        Biology: {
            "11": {
                "Biomolecules": "338",
                "Respiration and Energy Transfer": "339",
                "Human Nutrition": "340",
                "Excretion and Osmoregulation": "341"
            },
            "12": {
                "Reproduction in Lower and Higher Plants": "342",
                "Reproduction in Lower and Higher Animals": "343",
                "Inheritance and Variation": "344",
                "Molecular Basis of Inheritance": "345",
                "Origin and Evolution of Life": "346",
                "Plant Water Relation": "347",
                "Plant Growth and Mineral Nutrition": "348",
                "Respiration and Circulation": "349",
                "Control and Co-ordination": "350",
                "Human Health and Diseases": "351",
                "Enhancement of Food Production": "352",
                "Biotechnology": "353",
                "Organisms and Populations": "354",
                "Ecosystems and Energy Flow": "355",
                "Biodiversity, Conservation and Environmental Issues": "356"
            }
        }
    }


};

export {
    getTopics,
    data
};
