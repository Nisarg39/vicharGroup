const negativeMarkingRules = {
    "exams": [
      {
        "name": "JEE Main",
        "conductedBy": "NTA",
        "markingScheme": {
          "MCQ": {
            "correct": 4,
            "incorrect": -1,
            "unanswered": 0,
            "note": "Only single correct option. -1 negative marking."
          },
          "Numerical": {
            "correct": 4,
            "incorrect": 0,
            "unanswered": 0,
            "note": "No negative marking."
          }
        }
      },
      {
        "name": "NEET",
        "conductedBy": "NTA",
        "markingScheme": {
          "MCQ": {
            "correct": 4,
            "incorrect": -1,
            "unanswered": 0,
            "note": "Only single correct option. -1 negative marking."
          }
        }
      },
      {
        "name": "MHT-CET",
        "conductedBy": "State CET Cell, Maharashtra",
        "markingScheme": {
          "Physics": {
            "correct": 1,
            "incorrect": 0,
            "unanswered": 0
          },
          "Chemistry": {
            "correct": 1,
            "incorrect": 0,
            "unanswered": 0
          },
          "Mathematics": {
            "correct": 2,
            "incorrect": 0,
            "unanswered": 0
          },
          "note": "No negative marking in any section."
        }
      }
    ]
  }
  
export default negativeMarkingRules;