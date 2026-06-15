import { Router } from 'express';
import { handleWebRoute } from '../adaptor';
import { GET as getEmployees, POST as createEmployee } from '../api/employees/route';
import { PUT as updateEmployee, DELETE as deleteEmployee } from '../api/employees/[id]/route';
import { GET as getDeletedEmployees } from '../api/employees/deleted/route';

const router = Router();

router.get('/', handleWebRoute(getEmployees));
router.post('/', handleWebRoute(createEmployee));
router.get('/deleted', handleWebRoute(getDeletedEmployees));
router.put('/:id', handleWebRoute(updateEmployee));
router.delete('/:id', handleWebRoute(deleteEmployee));

export default router;
