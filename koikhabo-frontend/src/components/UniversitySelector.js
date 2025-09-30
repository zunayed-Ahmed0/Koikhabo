import React, { useState, useEffect } from 'react';
import './UniversitySelector.css';

const UniversitySelector = ({ onSelect, selectedUniversity }) => {
  const [universities, setUniversities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch universities from backend
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      console.log('Fetching universities from API...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/institutions/`);
      if (response.ok) {
        const data = await response.json();
        console.log('Universities API response:', data);
        // The API returns a direct array, not wrapped in an object
        const institutionsArray = Array.isArray(data) ? data : (data.institutions || []);

        // Add Northern University Bangladesh if not present
        const hasNorthernBangladesh = institutionsArray.some(uni =>
          uni.name.toLowerCase().includes('northern university bangladesh')
        );

        if (!hasNorthernBangladesh) {
          // Find Northern University and update it, or add new entry
          const northernIndex = institutionsArray.findIndex(uni =>
            uni.name.toLowerCase().includes('northern university')
          );

          if (northernIndex >= 0) {
            institutionsArray[northernIndex] = {
              ...institutionsArray[northernIndex],
              name: "Northern University Bangladesh",
              short_name: "NUB"
            };
          } else {
            institutionsArray.push({
              id: 999,
              name: "Northern University Bangladesh",
              short_name: "NUB",
              type: "university",
              area: "Airport"
            });
          }
        }

        console.log('Setting universities:', institutionsArray.length, 'institutions');
        setUniversities(institutionsArray);
      } else {
        console.error('Failed to fetch universities, using fallback');
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Failed to fetch universities:', error);
      // Comprehensive fallback data for all Dhaka universities and colleges
      setUniversities([
        // Major Public Universities
        { id: 1, name: "University of Dhaka", short_name: "DU", type: "university", area: "Ramna" },
        { id: 2, name: "Bangladesh University of Engineering and Technology", short_name: "BUET", type: "university", area: "Ramna" },
        { id: 3, name: "Jahangirnagar University", short_name: "JU", type: "university", area: "Savar" },
        { id: 4, name: "Dhaka University of Engineering & Technology", short_name: "DUET", type: "university", area: "Gazipur" },
        { id: 5, name: "Islamic University of Technology", short_name: "IUT", type: "university", area: "Gazipur" },

        // Private Universities
        { id: 6, name: "North South University", short_name: "NSU", type: "university", area: "Bashundhara" },
        { id: 7, name: "BRAC University", short_name: "BRACU", type: "university", area: "Mohakhali" },
        { id: 8, name: "Independent University Bangladesh", short_name: "IUB", type: "university", area: "Bashundhara" },
        { id: 9, name: "American International University Bangladesh", short_name: "AIUB", type: "university", area: "Banani" },
        { id: 10, name: "East West University", short_name: "EWU", type: "university", area: "Aftabnagar" },
        { id: 11, name: "United International University", short_name: "UIU", type: "university", area: "Badda" },
        { id: 12, name: "Daffodil International University", short_name: "DIU", type: "university", area: "Dhanmondi" },
        { id: 13, name: "Ahsanullah University of Science and Technology", short_name: "AUST", type: "university", area: "Tejgaon" },
        { id: 14, name: "Stamford University Bangladesh", short_name: "SUB", type: "university", area: "Dhanmondi" },
        { id: 15, name: "University of Asia Pacific", short_name: "UAP", type: "university", area: "Farmgate" },
        { id: 16, name: "Northern University Bangladesh", short_name: "NUB", type: "university", area: "Airport" },
        { id: 17, name: "Southeast University", short_name: "SEU", type: "university", area: "Banani" },
        { id: 18, name: "University of Liberal Arts Bangladesh", short_name: "ULAB", type: "university", area: "Dhanmondi" },
        { id: 19, name: "Bangladesh University", short_name: "BU", type: "university", area: "Mohammadpur" },
        { id: 20, name: "Manarat International University", short_name: "MIU", type: "university", area: "Gulshan" },

        // Medical Colleges
        { id: 21, name: "Dhaka Medical College", short_name: "DMC", type: "medical_college", area: "Ramna" },
        { id: 22, name: "Sir Salimullah Medical College", short_name: "SSMC", type: "medical_college", area: "Mitford" },
        { id: 23, name: "Sher-e-Bangla Medical College", short_name: "SBMC", type: "medical_college", area: "Baridhara" },
        { id: 24, name: "Bangabandhu Sheikh Mujib Medical University", short_name: "BSMMU", type: "medical_university", area: "Shahbag" },
        { id: 25, name: "Armed Forces Medical College", short_name: "AFMC", type: "medical_college", area: "Dhaka Cantonment" },

        // Major Colleges
        { id: 26, name: "Dhaka College", short_name: "DC", type: "college", area: "New Market" },
        { id: 27, name: "Intermediate College Dhaka", short_name: "ICD", type: "college", area: "Dhanmondi" },
        { id: 28, name: "Government Science College", short_name: "GSC", type: "college", area: "Tejgaon" },
        { id: 29, name: "Dhaka City College", short_name: "DCC", type: "college", area: "Dhanmondi" },
        { id: 30, name: "Begum Badrunnesa Government Girls College", short_name: "BBGGC", type: "college", area: "Bakshibazar" },
        { id: 31, name: "Eden Mohila College", short_name: "EMC", type: "college", area: "Azimpur" },
        { id: 32, name: "Holy Cross College", short_name: "HCC", type: "college", area: "Tejgaon" },
        { id: 33, name: "Viqarunnisa Noon College", short_name: "VNC", type: "college", area: "Bashir Uddin Road" },
        { id: 34, name: "Dhaka Commerce College", short_name: "DCC", type: "college", area: "Mirpur" },
        { id: 35, name: "Government Titumir College", short_name: "GTC", type: "college", area: "Mohakhali" },

        // Technical Institutes
        { id: 36, name: "Bangladesh Institute of Technology", short_name: "BIT", type: "institute", area: "Ramna" },
        { id: 37, name: "Dhaka Polytechnic Institute", short_name: "DPI", type: "institute", area: "Tejgaon" },
        { id: 38, name: "Graphics Arts Institute", short_name: "GAI", type: "institute", area: "Mohammadpur" },
        { id: 39, name: "Institute of Business Administration", short_name: "IBA", type: "institute", area: "Ramna" },
        { id: 40, name: "Bangladesh Agricultural University", short_name: "BAU", type: "university", area: "Mymensingh" }
      ]);
    }
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (uni.area && uni.area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (university) => {
    onSelect(university);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getUniversityIcon = (type) => {
    switch (type) {
      case 'university': return '🏛️';
      case 'medical_college':
      case 'medical_university': return '🏥';
      case 'institute': return '🏢';
      case 'college': return '🎓';
      default: return '🏫';
    }
  };

  return (
    <div className="university-selector">
      <label className="selector-label">Select Your Institution</label>
      <div className="selector-container">
        <div 
          className={`selector-input ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedUniversity ? (
            <div className="selected-university">
              <span className="uni-icon">{getUniversityIcon(selectedUniversity.type)}</span>
              <div className="uni-info">
                <span className="uni-name">{selectedUniversity.name}</span>
                <span className="uni-short">({selectedUniversity.short_name})</span>
              </div>
            </div>
          ) : (
            <span className="placeholder">Choose your university or college...</span>
          )}
          <span className={`dropdown-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
        </div>

        {isOpen && (
          <div className="selector-dropdown">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search institutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>
            
            <div className="universities-list">
              {filteredUniversities.length > 0 ? (
                filteredUniversities.map(university => (
                  <div
                    key={university.id}
                    className="university-option"
                    onClick={() => handleSelect(university)}
                  >
                    <span className="uni-icon">{getUniversityIcon(university.type)}</span>
                    <div className="uni-info">
                      <div className="uni-main">
                        <span className="uni-name">{university.name}</span>
                        <span className="uni-short">({university.short_name})</span>
                      </div>
                      {university.area && (
                        <div className="uni-location">📍 {university.area}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <span>No institutions found</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitySelector;
