
from risk_analyzer import analyze_contract


contract_text = """
1. Term of Employment
The employment of the Employee shall commence from the date
hereof and continue for an indefinite term until terminated
in accordance with the provisions of this agreement.

2. Probation
The parties hereto agree that the initial six month period
of this agreement is Probationary.
Either party may terminate the employment relationship at
any time during the initial six month period with advance
notice of seven days with justifiable reason.

3. Compensation and Benefits
The Employee shall be paid a basic salary of Nu. _______
a month, less applicable statutory deductions.
The Employee is entitled to receive benefits in accordance
with the Employer's standard benefit package, as amended
from time to time.

4. Duties and Responsibilities
The Employee shall be employed in the capacity of _______,
the current duties and responsibilities of which are set
out in Annexure A annexed hereto and forming part of this
agreement.
These duties and responsibilities may be amended from time
to time in the sole discretion of the Employer, subject to
formal notification being provided to the Employee.

5. Termination of Employment
Subsequent to completion of the probationary term, the
Employer may terminate the employment of the Employee at
any time for just cause at common law.
The Employee and Employer may terminate their employment
at any time by providing at least seven days notice for
probationer and one month advance notice for their intention
to terminate the contract of employment or payment in lieu
thereof.
The entitlements and termination of services will be
governed by the Labour and Employment Act, 2007 and its
regulations and laws of the land.
"""


result = analyze_contract(contract_text)

print("Total findings:", result["total_findings"])
print()

for finding in result["findings"]:
    print("Clause:", finding["clause_number"])
    print("Category:", finding["category"])
    print("Severity:", finding["severity"])
    print("Matched phrases:", finding["matched_phrases"])
    print("Explanation:", finding["explanation"])
    print("-" * 50)