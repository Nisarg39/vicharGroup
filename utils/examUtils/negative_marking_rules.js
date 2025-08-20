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
            "incorrect": -1,
            "unanswered": 0,
            "note": "No negative marking."
          }
        }
      },
      {
        "name": "JEE Advanced",
        "conductedBy": "IIT",
        "markingScheme": {
          "MCQ": {
            "correct": 3,
            "incorrect": -1,
            "unanswered": 0,
            "note": "Single correct option. -1 negative marking."
          },
          "MCMA": {
            "correct": 4,
            "incorrect": -2,
            "unanswered": 0,
            "note": "Multiple correct options. -2 negative marking when wrong options selected (latest JEE Advanced rules). Partial marks awarded for correct selections without wrong ones."
          },
          "Numerical": {
            "correct": 4,
            "incorrect": -1,
            "unanswered": 0,
            "note": "No negative marking for numerical questions."
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