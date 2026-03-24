from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.organisations.models import Organisation, Department, Hierarchy
from apps.organisations.services.structure.hierarchy import HierarchyService

User = get_user_model()

class StructureServicesTestCase(TestCase):
    def setUp(self):
        self.org = Organisation.objects.create(name="Acme Corp", slug="acme")
        
        # We need a proper user model save depending on how accounts is configured
        # Doing raw creates to avoid required field failures in custom accounts
        self.ceo = User.objects.create(email="ceo@acme.com", username="ceo")
        self.manager = User.objects.create(email="manager@acme.com", username="manager")
        self.staff = User.objects.create(email="staff@acme.com", username="staff")

    def test_assign_supervisor(self):
        HierarchyService.assign_supervisor(self.manager, self.ceo, self.org)
        self.assertEqual(Hierarchy.objects.count(), 1)
        self.assertEqual(Hierarchy.objects.first().supervisor, self.ceo)
        
    def test_management_chain(self):
        # CEO -> Manager -> Staff
        HierarchyService.assign_supervisor(self.manager, self.ceo, self.org)
        HierarchyService.assign_supervisor(self.staff, self.manager, self.org)
        
        chain = HierarchyService.get_management_chain(self.staff)
        self.assertEqual(len(chain), 2)
        self.assertEqual(chain[0], self.manager)
        self.assertEqual(chain[1], self.ceo)

    def test_circular_supervisor_assignment_fails(self):
        with self.assertRaises(ValueError):
            HierarchyService.assign_supervisor(self.ceo, self.ceo, self.org)
