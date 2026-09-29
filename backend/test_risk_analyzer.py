
from risk_analyzer import analyze_contract


sample_contract = """
The agreement shall automatically renew for successive terms
of one year unless either party provides written notice.

The supplier shall indemnify and hold harmless the customer
against certain claims.

The customer must pay a late payment fee on overdue payments.
"""

result = analyze_contract(sample_contract)

print("Total findings:", result["total_findings"])

for finding in result["findings"]:
    print("\nCategory:", finding["category"])
    print("Severity:", finding["severity"])
    print("Matched phrases:", finding["matched_phrases"])
    print("Clause:", finding["clause"])
    print("Explanation:", finding["explanation"])