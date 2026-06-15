import { Router } from 'express';
import { handleWebRoute } from '../adaptor';
import { GET as getPayroll, POST as createPayroll } from '../api/payroll/route';
import { POST as generatePayroll } from '../api/payroll/generate/route';
import { GET as getBankDetails, POST as updateBankDetails } from '../api/payroll/bank/route';
import { PUT as updatePayroll, DELETE as deletePayroll } from '../api/payroll/[id]/route';

const router = Router();

router.get('/', handleWebRoute(getPayroll));
router.post('/', handleWebRoute(createPayroll));
router.post('/generate', handleWebRoute(generatePayroll));
router.get('/bank', handleWebRoute(getBankDetails));
router.post('/bank', handleWebRoute(updateBankDetails));
router.put('/:id', handleWebRoute(updatePayroll));
router.delete('/:id', handleWebRoute(deletePayroll));

export default router;
