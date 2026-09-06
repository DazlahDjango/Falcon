import csv
import io
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..permissions import IsAuthenticatedAndActive

class BulkTemplateDownloadView(APIView):
    permission_classes = [IsAuthenticatedAndActive]
    
    def get(self, request, template_type):
        output = io.StringIO()
        writer = csv.writer(output)
        
        if template_type == 'kpi':
            # Headers
            writer.writerow(['Code', 'Name', 'Description', 'Type', 'Calculation Logic', 'Measure Type', 'Unit', 'Decimal Places', 'Target Min', 'Target Max'])
            # Sample Row
            writer.writerow(['REV_001', 'Net Sales', 'Net sales revenue generated', 'FINANCIAL', 'HIGHER_IS_BETTER', 'CUMULATIVE', 'USD', '2', '0.00', '1000000.00'])
        elif template_type == 'target':
            # Headers
            writer.writerow(['kpi_id', 'user_id', 'year', 'target_value', 'notes'])
            # Sample Row
            writer.writerow(['f5f02c63-455b-439f-b98a-5b1234567890', '3b2d18cb-8e0f-48d2-b6ab-e12345678901', '2026', '50000.00', 'Annual net sales performance milestone'])
        elif template_type == 'actual':
            # Headers
            writer.writerow(['kpi_id', 'user_id', 'year', 'month', 'actual_value', 'notes'])
            # Sample Row
            writer.writerow(['f5f02c63-455b-439f-b98a-5b1234567890', '3b2d18cb-8e0f-48d2-b6ab-e12345678901', '2026', '7', '4500.00', 'Entered July actual sales metrics'])
        else:
            return Response({'error': f'Invalid template type: {template_type}'}, status=status.HTTP_400_BAD_REQUEST)
            
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{template_type}_template.csv"'
        return response
