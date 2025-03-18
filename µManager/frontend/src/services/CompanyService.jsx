// Service pour gérer les entreprises de l'utilisateur

export const fetchUserCompanies = async (userId, token) => {
    try {
      const response = await fetch('http://localhost:3000/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des entreprises');
      }
      
      const data = await response.json();
      
      // Filtrer les entreprises appartenant à l'utilisateur
      const userCompanies = data.filter(company => company.user && company.user.userId === parseInt(userId));
      
      return userCompanies;
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  };
  
  export const getCurrentCompanyId = () => {
    return localStorage.getItem('companyId');
  };
  
  export const setCurrentCompanyId = (companyId) => {
    localStorage.setItem('companyId', companyId);
  };