import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, LogOut, Clock, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AgentDashboardShimmer from '../../components/shimmer/AgentDashboardShimmer';

function AgentDashboard({ user }) {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stageFilter, setStageFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editingNotes, setEditingNotes] = useState({});
  const [notesText, setNotesText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await api.get('/visit-requests');
      setVisits(response.data);
      
      const propIds = [...new Set(response.data.map(v => v.property_id))];
      const propPromises = propIds.map(id => api.get(`/properties/${id}`).catch(() => null));
      const propResponses = await Promise.all(propPromises);
      setProperties(propResponses.filter(r => r).map(r => r.data));
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (visitId, stage) => {
    try {
      await api.patch(`/visit-requests/${visitId}`, null, { params: { stage } });
      toast.success('Stage updated');
      fetchVisits();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  const saveNotes = async (visitId) => {
    try {
      await api.patch(`/visit-requests/${visitId}`, null, { 
        params: { notes: notesText[visitId] || '' } 
      });
      toast.success('Notes saved successfully');
      setEditingNotes({ ...editingNotes, [visitId]: false });
      fetchVisits();
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const startEditingNotes = (visitId, currentNotes) => {
    setNotesText({ ...notesText, [visitId]: currentNotes || '' });
    setEditingNotes({ ...editingNotes, [visitId]: true });
  };

  const cancelEditingNotes = (visitId) => {
    setEditingNotes({ ...editingNotes, [visitId]: false });
    setNotesText({ ...notesText, [visitId]: visits.find(v => v.visit_id === visitId)?.notes || '' });
  };

  // Filter visits by stage
  const filteredVisits = stageFilter === 'all' 
    ? visits 
    : visits.filter(v => v.stage === stageFilter);

  // Toggle row expansion
  const toggleRow = (visitId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(visitId)) {
      newExpanded.delete(visitId);
    } else {
      newExpanded.add(visitId);
    }
    setExpandedRows(newExpanded);
  };

  // Get complete activity timeline for a visit
  const getVisitActivity = (visit) => {
    return visit.activity_log || [];
  };

  if (loading) {
    return <AgentDashboardShimmer />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-base sm:text-2xl font-bold truncate">Agent Dashboard</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <span className="sm:hidden text-xs text-muted-foreground truncate max-w-[80px]">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Assigned Visits</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your assigned property visits</p>
        </div>

        <div className="flex items-center justify-end mb-4">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="stage-filter">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="talked">Talked</SelectItem>
              <SelectItem value="visit_scheduled">Visit Scheduled</SelectItem>
              <SelectItem value="visit_completed">Visit Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="min-w-[150px]">Property</TableHead>
                <TableHead className="min-w-[120px]">User</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="min-w-[100px]">Stage</TableHead>
                <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                <TableHead className="min-w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => {
                const property = properties.find(p => p.property_id === visit.property_id);
                const isExpanded = expandedRows.has(visit.visit_id);
                const activities = getVisitActivity(visit);
                
                return (
                  <React.Fragment key={visit.visit_id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <button
                          onClick={() => toggleRow(visit.visit_id)}
                          className="text-muted-foreground hover:text-foreground"
                          data-testid={`expand-row-${visit.visit_id}`}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">{property?.title}</TableCell>
                      <TableCell>{visit.user_name}</TableCell>
                      <TableCell className="hidden md:table-cell">{visit.user_phone}</TableCell>
                      <TableCell>
                        <Badge className="text-xs whitespace-nowrap">{visit.stage}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(visit.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Select onValueChange={(value) => updateStage(visit.visit_id, value)}>
                            <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm">
                              <SelectValue placeholder="Update Stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="talked">Talked</SelectItem>
                              <SelectItem value="visit_scheduled">Visit Scheduled</SelectItem>
                              <SelectItem value="visit_completed">Visit Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                data-testid={`view-activity-${visit.visit_id}`}
                                onClick={() => {
                                  setNotesText({ ...notesText, [visit.visit_id]: visit.notes || '' });
                                  setEditingNotes({ ...editingNotes, [visit.visit_id]: false });
                                }}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-base sm:text-lg pr-6">{property?.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                  <div className="text-sm">
                                    <p className="font-medium">{visit.user_name}</p>
                                    <p className="text-muted-foreground text-xs sm:text-sm">{visit.user_email}</p>
                                    <p className="text-muted-foreground text-xs sm:text-sm">{visit.user_phone}</p>
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <Clock className="h-4 w-4" />
                                    Complete Activity History
                                  </h4>
                                  <div className="space-y-3">
                                    {activities.map((activity, index) => (
                                      <div key={index} className="flex gap-3 sm:gap-4 pb-3 border-b last:border-b-0">
                                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm break-words">{activity.action}</p>
                                          <p className="text-xs text-muted-foreground mt-1 break-words">
                                            {new Date(activity.timestamp).toLocaleString()} • by {activity.actor} ({activity.actor_role})
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">Notes:</p>
                                    {!editingNotes[visit.visit_id] && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => startEditingNotes(visit.visit_id, visit.notes)}
                                        data-testid={`edit-notes-${visit.visit_id}`}
                                      >
                                        Edit
                                      </Button>
                                    )}
                                  </div>
                                  {editingNotes[visit.visit_id] ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={notesText[visit.visit_id] || ''}
                                        onChange={(e) => setNotesText({ ...notesText, [visit.visit_id]: e.target.value })}
                                        placeholder="Add notes about this visit..."
                                        rows={4}
                                        className="text-sm"
                                        data-testid={`notes-textarea-${visit.visit_id}`}
                                      />
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm" 
                                          onClick={() => saveNotes(visit.visit_id)}
                                          data-testid={`save-notes-${visit.visit_id}`}
                                        >
                                          <Save className="h-4 w-4 mr-2" />
                                          Save
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => cancelEditingNotes(visit.visit_id)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground break-words">
                                      {visit.notes || 'No notes added yet'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>Recent Activity</span>
                            </div>
                            <div className="space-y-2 pl-6">
                              {activities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 text-sm">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                                  <div className="flex-1">
                                    <span className="text-foreground">{activity.action}</span>
                                    <span className="text-muted-foreground ml-2">
                                      {new Date(activity.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {visit.notes && (
                              <div className="mt-3 pl-6 text-sm">
                                <span className="font-medium">Notes: </span>
                                <span className="text-muted-foreground">{visit.notes}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          {filteredVisits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No visits found for this stage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;
