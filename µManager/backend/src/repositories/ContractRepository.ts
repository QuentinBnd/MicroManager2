import { AppDataSource } from '../config/data-source';
import { Contract } from '../entities/Contract';

export const ContractRepository = AppDataSource.getRepository(Contract).extend({
  findAll(companyId: number) {
    return this.find({
      where: { company: { companyId } },
      relations: ['client', 'company'],
    });
  },

  findById(contractId: number) {
    return this.findOne({
      where: { contractId },
      relations: ['client', 'company'],
    });
  },

  createContract(data: Partial<Contract>) {
    const contract = this.create(data);
    return this.save(contract);
  },

  updateContract(contractId: number, data: Partial<Contract>) {
    return this.update({ contractId }, data);
  },

  deleteContract(contractId: number) {
    return this.delete({ contractId });
  },
});